package pricing

import (
	"context"
	"fmt"
	"testing"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
)

type mockPricingRepository struct {
	data map[string]*PricingResult
}

func newMockPricingRepository() *mockPricingRepository {
	return &mockPricingRepository{data: make(map[string]*PricingResult)}
}

func (m *mockPricingRepository) Upsert(ctx context.Context, result *PricingResult) error {
	m.data[result.CaseID] = result
	return nil
}

func (m *mockPricingRepository) GetByCaseID(ctx context.Context, caseID string) (*PricingResult, error) {
	r, ok := m.data[caseID]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return r, nil
}

type mockCostingRepository struct {
	data map[string]*costing.CostData
}

func newMockCostingRepository() *mockCostingRepository {
	return &mockCostingRepository{data: make(map[string]*costing.CostData)}
}

func (m *mockCostingRepository) Upsert(ctx context.Context, data *costing.CostData) error {
	m.data[data.CaseID] = data
	return nil
}

func (m *mockCostingRepository) GetByCaseID(ctx context.Context, caseID string) (*costing.CostData, error) {
	d, ok := m.data[caseID]
	if !ok {
		return nil, fmt.Errorf("costing data not found")
	}
	return d, nil
}

func TestApplyIncotermFormula(t *testing.T) {
	// TC-BIZ-001: EXW: HPP=1M, Pkg=50k, Cert=100k, Margin=20%
	cd := &costing.CostData{
		HPP:           1000000,
		Packaging:     50000,
		Certification: 100000,
		TargetMargin:  20.0,
		ExchangeRate:  16000,
	}

	res := applyIncotermFormula("case-1", "comp-1", "EXW", cd)

	if res.TotalCostIDR != 1150000 {
		t.Errorf("expected cost 1150000, got %.2f", res.TotalCostIDR)
	}
	if res.SellingPriceIDR != 1380000 {
		t.Errorf("expected selling price 1380000, got %.2f", res.SellingPriceIDR)
	}
	expectedUSD := 1380000.0 / 16000.0 // 86.25
	if res.SellingPriceUSD != expectedUSD {
		t.Errorf("expected selling price USD %.2f, got %.2f", expectedUSD, res.SellingPriceUSD)
	}
}

func TestCalculateAndSave_Success(t *testing.T) {
	pricingRepo := newMockPricingRepository()
	costingRepo := newMockCostingRepository()
	svc := NewService(pricingRepo, costingRepo)
	ctx := context.Background()

	// Setup costing data first
	cd := &costing.CostData{
		CaseID:         "case-123",
		CompanyID:      "company-abc",
		HPP:            2000000,
		Packaging:      100000,
		Certification:  200000,
		Transportation: 400000,
		Freight:        600000,
		Insurance:      100000,
		ExchangeRate:   16000,
		TargetMargin:   25.0,
		Quantity:       2000,
	}
	_ = costingRepo.Upsert(ctx, cd)

	req := CalculatePricingRequest{
		Incoterm: "CIF",
	}

	res, err := svc.CalculateAndSave(ctx, "case-123", "company-abc", req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// CIF Cost = 2M + 100k + 200k (EXW) + 400k (FOB) + 600k (CFR) + 100k (CIF) = 3.4M
	expectedCost := 3400000.0
	if res.TotalCostIDR != expectedCost {
		t.Errorf("expected CIF cost %.2f, got %.2f", expectedCost, res.TotalCostIDR)
	}

	expectedProfit := expectedCost * 0.25 // 850,000
	if res.ProfitIDR != expectedProfit {
		t.Errorf("expected profit %.2f, got %.2f", expectedProfit, res.ProfitIDR)
	}

	expectedPriceIDR := expectedCost + expectedProfit // 4,250,000
	if res.SellingPriceIDR != expectedPriceIDR {
		t.Errorf("expected selling price IDR %.2f, got %.2f", expectedPriceIDR, res.SellingPriceIDR)
	}

	expectedPriceUSD := expectedPriceIDR / 16000.0 // 265.625
	roundedExpectedPriceUSD := float64(int(expectedPriceUSD*100+0.5)) / 100 // 265.63
	if res.SellingPriceUSD != roundedExpectedPriceUSD {
		t.Errorf("expected selling price USD %.2f, got %.2f", roundedExpectedPriceUSD, res.SellingPriceUSD)
	}

	// Verify database persistence
	stored, err := pricingRepo.GetByCaseID(ctx, "case-123")
	if err != nil {
		t.Fatalf("expected to find pricing in repo, got %v", err)
	}
	if stored.SellingPriceUSD != res.SellingPriceUSD {
		t.Errorf("stored selling price USD doesn't match")
	}
}

func TestCalculateAndSave_PrerequisiteMissing(t *testing.T) {
	pricingRepo := newMockPricingRepository()
	costingRepo := newMockCostingRepository()
	svc := NewService(pricingRepo, costingRepo)
	ctx := context.Background()

	// Do not insert costing data
	req := CalculatePricingRequest{
		Incoterm: "FOB",
	}

	_, err := svc.CalculateAndSave(ctx, "case-999", "company-abc", req)
	if err == nil {
		t.Fatalf("expected error for missing costing data, got nil")
	}

	appErr, ok := err.(*apperror.AppError)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != "UNPROCESSABLE" || appErr.HTTPStatus != 422 || appErr.Message != "prerequisite_data_missing: cost_data must be saved before calculating pricing" {
		t.Errorf("unexpected error format: Code=%s, Status=%d, Msg=%s", appErr.Code, appErr.HTTPStatus, appErr.Message)
	}
}
