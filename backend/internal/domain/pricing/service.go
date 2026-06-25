package pricing

import (
	"context"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/pkg/validator"
)

// Service handles the Incoterm pricing engine (SRS FR-011, FR-012).
// CalculateFromCostData is the primary entry point — loads cost_data and persists result.
type Service struct {
	repo        Repository
	costingRepo costing.Repository
}

func NewService(repo Repository, costingRepo costing.Repository) *Service {
	return &Service{repo: repo, costingRepo: costingRepo}
}

// CalculateAndSave loads cost_data for the case, applies the SRS Incoterm formula,
// converts to USD, and persists the result.
func (s *Service) CalculateAndSave(ctx context.Context, caseID, companyID string, req CalculatePricingRequest) (*PricingResult, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}

	// Load cost data — prerequisite for pricing.
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data must be saved before calculating pricing", 422)
	}

	result := applyIncotermFormula(caseID, companyID, req.Incoterm, cd)

	if err := s.repo.Upsert(ctx, result); err != nil {
		return nil, err
	}
	return result, nil
}

// GetResult loads the latest stored pricing result.
func (s *Service) GetResult(ctx context.Context, caseID string) (*PricingResult, error) {
	return s.repo.GetByCaseID(ctx, caseID)
}

// applyIncotermFormula implements SRS §5.1 cumulative Incoterm cost formulas.
// TC-BIZ-001: EXW HPP=1M, Pkg=50k, Cert=100k → EXW Cost=1.15M, Price=1.38M (margin=20%)
func applyIncotermFormula(caseID, companyID, incoterm string, cd *costing.CostData) *PricingResult {
	// SRS §5.1 cumulative formulas (all in IDR)
	exwCost := cd.HPP + cd.Packaging + cd.Certification
	fobCost := exwCost + cd.Transportation
	cfrCost := fobCost + cd.Freight
	cifCost := cfrCost + cd.Insurance

	var totalCost float64
	var breakdown IncotermCostBreakdown
	breakdown.HPP = cd.HPP
	breakdown.Packaging = cd.Packaging
	breakdown.Certification = cd.Certification

	switch incoterm {
	case IncotermEXW:
		totalCost = exwCost
	case IncotermFOB:
		totalCost = fobCost
		breakdown.Transportation = cd.Transportation
	case IncotermCFR:
		totalCost = cfrCost
		breakdown.Transportation = cd.Transportation
		breakdown.Freight = cd.Freight
	case IncotermCIF:
		totalCost = cifCost
		breakdown.Transportation = cd.Transportation
		breakdown.Freight = cd.Freight
		breakdown.Insurance = cd.Insurance
	}
	breakdown.TotalCostIDR = totalCost

	profit := totalCost * (cd.TargetMargin / 100)
	sellingPriceIDR := totalCost + profit

	// Actual margin based on selling price
	actualMargin := 0.0
	if sellingPriceIDR > 0 {
		actualMargin = (profit / sellingPriceIDR) * 100
	}

	sellingPriceUSD := 0.0
	if cd.ExchangeRate > 0 {
		sellingPriceUSD = sellingPriceIDR / cd.ExchangeRate
	}

	return &PricingResult{
		CaseID:          caseID,
		CompanyID:       companyID,
		Incoterm:        incoterm,
		TotalCostIDR:    totalCost,
		ProfitIDR:       profit,
		SellingPriceIDR: sellingPriceIDR,
		SellingPriceUSD: round2(sellingPriceUSD),
		ExchangeRate:    cd.ExchangeRate,
		TargetMargin:    cd.TargetMargin,
		ActualMarginPct: round2(actualMargin),
		Breakdown:       breakdown,
	}
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
