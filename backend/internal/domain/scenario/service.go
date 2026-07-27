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

func computeScenario(caseID, companyID, name, incoterm string, cd *costing.CostData, marginOverride *float64) *Scenario {
	margin := cd.TargetMargin
	if marginOverride != nil {
		margin = *marginOverride
	}

	totalCost := incotermCost(incoterm, cd)
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

	return &Scenario{
		CaseID:               caseID,
		CompanyID:            companyID,
		Name:                 name,
		Incoterm:             incoterm,
		TargetMarginOverride: marginOverride,
		TotalCostIDR:         round2(totalCost),
		SellingPriceIDR:      round2(sellingPriceIDR),
		SellingPriceUSD:      round2(sellingPriceUSD),
		ProfitIDR:            round2(profit),
		ActualMarginPct:      round2(actualMargin),
	}
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

	sc := computeScenario(caseID, companyID, strings.TrimSpace(req.Name), req.Incoterm, cd, req.TargetMarginOverride)
	sc.Notes = strings.TrimSpace(req.Notes)

	if err := s.repo.Create(ctx, sc); err != nil {
		return nil, err
	}
	return sc, nil
}

// List returns all scenarios for a case.
// If no custom scenarios exist, it automatically generates 4 default scenarios (EXW, FOB, CFR, CIF).
func (s *Service) List(ctx context.Context, caseID string) ([]*Scenario, error) {
	list, err := s.repo.ListByCaseID(ctx, caseID)
	if err != nil {
		return nil, err
	}
	if len(list) > 0 {
		return list, nil
	}

	// Auto-generate default scenarios for EXW, FOB, CFR, CIF if cost_data is available
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil || cd == nil {
		return list, nil
	}

	defaults := []struct {
		name     string
		incoterm string
	}{
		{name: "Standard EXW (Ex Works)", incoterm: "EXW"},
		{name: "Standard FOB (Free On Board)", incoterm: "FOB"},
		{name: "Standard CFR (Cost and Freight)", incoterm: "CFR"},
		{name: "Standard CIF (Cost Insurance Freight)", incoterm: "CIF"},
	}

	var generated []*Scenario
	for _, def := range defaults {
		sc := computeScenario(caseID, cd.CompanyID, def.name, def.incoterm, cd, nil)
		if createErr := s.repo.Create(ctx, sc); createErr == nil {
			generated = append(generated, sc)
		}
	}

	if len(generated) > 0 {
		return generated, nil
	}

	return list, nil
}

// Compare loads the requested scenario IDs side-by-side for comparison.
func (s *Service) Compare(ctx context.Context, caseID string, ids []string) ([]*Scenario, error) {
	return s.repo.GetByIDs(ctx, caseID, ids)
}

// Update recalculates and updates a scenario with new name/incoterm/margin.
func (s *Service) Update(ctx context.Context, caseID, scenarioID string, req UpdateScenarioRequest) (*Scenario, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "cost_data missing", 422)
	}

	sc := computeScenario(caseID, cd.CompanyID, strings.TrimSpace(req.Name), req.Incoterm, cd, req.TargetMarginOverride)
	sc.Notes = strings.TrimSpace(req.Notes)

	updates := map[string]any{
		"name":            sc.Name,
		"notes":           sc.Notes,
		"incoterm":        sc.Incoterm,
		"totalCostIDR":    sc.TotalCostIDR,
		"sellingPriceIDR": sc.SellingPriceIDR,
		"sellingPriceUSD": sc.SellingPriceUSD,
		"profitIDR":       sc.ProfitIDR,
		"actualMarginPct": sc.ActualMarginPct,
	}
	if req.TargetMarginOverride != nil {
		updates["targetMarginOverride"] = *req.TargetMarginOverride
	}

	if err := s.repo.Update(ctx, scenarioID, updates); err != nil {
		return nil, err
	}
	sc.ID = scenarioID
	return sc, nil
}

// Delete removes a scenario by ID.
func (s *Service) Delete(ctx context.Context, scenarioID string) error {
	return s.repo.Delete(ctx, scenarioID)
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

