package financial

import (
	"context"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/pricing"
	"github.com/exora/backend/pkg/validator"
)

// Service handles SRS FR-013 financial analysis.
// Depends on costing and pricing repositories to read prerequisite data.
type Service struct {
	repo        Repository
	costingRepo costing.Repository
	pricingRepo pricing.Repository
}

func NewService(repo Repository, costingRepo costing.Repository, pricingRepo pricing.Repository) *Service {
	return &Service{repo: repo, costingRepo: costingRepo, pricingRepo: pricingRepo}
}

// Recalculate loads cost_data + pricing_results for the case, computes SRS financial metrics,
// and persists the result (overwrite semantics).
func (s *Service) Recalculate(ctx context.Context, caseID, companyID string, req RecalculateRequest) (*FinancialAnalysis, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}

	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data required", 422)
	}
	pr, err := s.pricingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: pricing_results required (run /pricing/calculate first)", 422)
	}

	// Re-derive cost for the requested incoterm using stored cost data
	totalCostIDR := incotermCost(req.Incoterm, cd)
	sellingPriceIDR := totalCostIDR * (1 + cd.TargetMargin/100)
	qty := cd.Quantity

	// SRS §5.2 formulas
	revenueIDR := sellingPriceIDR * qty
	grossProfitIDR := revenueIDR - (totalCostIDR * qty)
	profitMarginPct := 0.0
	if revenueIDR > 0 {
		profitMarginPct = (grossProfitIDR / revenueIDR) * 100
	}
	roiPct := 0.0
	totalCostAll := totalCostIDR * qty
	if totalCostAll > 0 {
		roiPct = (grossProfitIDR / totalCostAll) * 100
	}

	// Break-even: Fixed = non-HPP costs; Variable cost per unit = HPP
	fixedCosts := nonHPPCost(req.Incoterm, cd)
	breakEvenQty := 0.0
	contribution := sellingPriceIDR - cd.HPP
	if contribution > 0 {
		breakEvenQty = fixedCosts / contribution
	}

	_ = pr // pricing result available for enrichment if needed

	analysis := &FinancialAnalysis{
		CaseID:           caseID,
		CompanyID:        companyID,
		SelectedIncoterm: req.Incoterm,
		Quantity:         qty,
		SellingPriceIDR:  round2(sellingPriceIDR),
		TotalCostIDR:     round2(totalCostIDR),
		RevenueIDR:       round2(revenueIDR),
		GrossProfitIDR:   round2(grossProfitIDR),
		ProfitMarginPct:  round2(profitMarginPct),
		ROIPct:           round2(roiPct),
		BreakEvenQty:     round2(breakEvenQty),
	}

	if err := s.repo.Upsert(ctx, analysis); err != nil {
		return nil, err
	}
	return analysis, nil
}

// GetAnalysis loads the latest stored financial analysis.
func (s *Service) GetAnalysis(ctx context.Context, caseID string) (*FinancialAnalysis, error) {
	return s.repo.GetByCaseID(ctx, caseID)
}

// incotermCost derives the Incoterm-specific total cost from stored cost data.
func incotermCost(incoterm string, cd *costing.CostData) float64 {
	base := cd.HPP + cd.Packaging + cd.Certification
	switch incoterm {
	case "EXW":
		return base
	case "FOB":
		return base + cd.Transportation
	case "CFR":
		return base + cd.Transportation + cd.Freight
	case "CIF":
		return base + cd.Transportation + cd.Freight + cd.Insurance
	}
	return base
}

// nonHPPCost returns the non-variable fixed export costs for break-even calculation.
func nonHPPCost(incoterm string, cd *costing.CostData) float64 {
	base := cd.Packaging + cd.Certification
	switch incoterm {
	case "EXW":
		return base
	case "FOB":
		return base + cd.Transportation
	case "CFR":
		return base + cd.Transportation + cd.Freight
	case "CIF":
		return base + cd.Transportation + cd.Freight + cd.Insurance
	}
	return base
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
