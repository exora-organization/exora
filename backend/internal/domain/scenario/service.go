package scenario

import (
	"context"
	"strings"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/pkg/validator"
)

// Service handles scenario analysis (SRS FR-014).
// Each scenario is a pricing variant computed from cost_data with optional overrides.
type Service struct {
	repo        Repository
	costingRepo costing.Repository
}

func NewService(repo Repository, costingRepo costing.Repository) *Service {
	return &Service{repo: repo, costingRepo: costingRepo}
}

// Create computes a new pricing variant from cost_data with optional margin override,
// then persists it as a scenario.
func (s *Service) Create(ctx context.Context, caseID, companyID string, req CreateScenarioRequest) (*Scenario, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}

	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data required for scenario creation", 422)
	}

	// Use override margin if provided, else fallback to cost_data targetMargin
	margin := cd.TargetMargin
	if req.TargetMarginOverride != nil {
		margin = *req.TargetMarginOverride
	}

	totalCost := incotermCost(req.Incoterm, cd)
	profit := totalCost * (margin / 100)
	sellingPriceIDR := totalCost + profit
	sellingPriceUSD := 0.0
	if cd.ExchangeRate > 0 {
		sellingPriceUSD = sellingPriceIDR / cd.ExchangeRate
	}
	actualMargin := 0.0
	if sellingPriceIDR > 0 {
		actualMargin = (profit / sellingPriceIDR) * 100
	}

	sc := &Scenario{
		CaseID:               caseID,
		CompanyID:            companyID,
		Name:                 strings.TrimSpace(req.Name),
		Notes:                strings.TrimSpace(req.Notes),
		Incoterm:             req.Incoterm,
		TargetMarginOverride: req.TargetMarginOverride,
		TotalCostIDR:         round2(totalCost),
		SellingPriceIDR:      round2(sellingPriceIDR),
		SellingPriceUSD:      round2(sellingPriceUSD),
		ProfitIDR:            round2(profit),
		ActualMarginPct:      round2(actualMargin),
	}

	if err := s.repo.Create(ctx, sc); err != nil {
		return nil, err
	}
	return sc, nil
}

// List returns all scenarios for a case.
func (s *Service) List(ctx context.Context, caseID string) ([]*Scenario, error) {
	return s.repo.ListByCaseID(ctx, caseID)
}

// Compare loads the requested scenario IDs side-by-side for comparison.
func (s *Service) Compare(ctx context.Context, caseID string, ids []string) ([]*Scenario, error) {
	return s.repo.GetByIDs(ctx, caseID, ids)
}

// incotermCost derives cost from cost data for the given incoterm.
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

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
