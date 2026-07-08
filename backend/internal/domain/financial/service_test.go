package financial

import (
	"context"
	"fmt"
	"testing"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/pricing"
)

type mockFinancialRepository struct {
	data map[string]*FinancialAnalysis
}

func newMockFinancialRepository() *mockFinancialRepository {
	return &mockFinancialRepository{data: make(map[string]*FinancialAnalysis)}
}

func (m *mockFinancialRepository) Upsert(ctx context.Context, analysis *FinancialAnalysis) error {
	m.data[analysis.CaseID] = analysis
	return nil
}

func (m *mockFinancialRepository) GetByCaseID(ctx context.Context, caseID string) (*FinancialAnalysis, error) {
	a, ok := m.data[caseID]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return a, nil
}

type mockPricingRepository struct {
	data map[string]*pricing.PricingResult
}

func newMockPricingRepository() *mockPricingRepository {
	return &mockPricingRepository{data: make(map[string]*pricing.PricingResult)}
}

func (m *mockPricingRepository) Upsert(ctx context.Context, result *pricing.PricingResult) error {
	m.data[result.CaseID] = result
	return nil
}

func (m *mockPricingRepository) GetByCaseID(ctx context.Context, caseID string) (*pricing.PricingResult, error) {
	r, ok := m.data[caseID]
	if !ok {
		return nil, fmt.Errorf("pricing data not found")
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

func TestFinancialCalculations(t *testing.T) {
	cd := &costing.CostData{
		HPP:            1000000,
		Packaging:      50000,
		Certification:  100000,
		Transportation: 200000,
		TargetMargin:   20.0,
		Quantity:       1000,
	}

	cost := incotermCost("FOB", cd)
	expectedCost := 1000000.0 + 50000.0 + 100000.0 + 200000.0 // 1,350,000
	if cost != expectedCost {
		t.Errorf("expected FOB cost %.2f, got %.2f", expectedCost, cost)
	}

	price := cost * (1 + cd.TargetMargin/100) // 1,620,000
	if price != 1620000 {
		t.Errorf("expected FOB price 1620000, got %.2f", price)
	}

	revenue := price * cd.Quantity // 1,620,000,000
	if revenue != 1620000000 {
		t.Errorf("expected revenue 1620000000, got %.2f", revenue)
	}

	profit := revenue - (cost * cd.Quantity) // 270,000,000
	if profit != 270000000 {
		t.Errorf("expected profit 270000000, got %.2f", profit)
	}

	margin := (profit / revenue) * 100 // 16.67%
	if round2(margin) != 16.67 {
		t.Errorf("expected margin 16.67%%, got %.2f%%", round2(margin))
	}

	roi := (profit / (cost * cd.Quantity)) * 100 // 20%
	if roi != 20 {
		t.Errorf("expected ROI 20%%, got %.2f%%", roi)
	}

	// Break-even
	fixed := nonHPPCost("FOB", cd) // 350,000
	contribution := price - cd.HPP // 620,000
	bep := fixed / contribution // 0.5645
	if round2(bep) != 0.56 {
		t.Errorf("expected BEP 0.56 units, got %.2f", round2(bep))
	}
}

func TestRecalculate_Success(t *testing.T) {
	financialRepo := newMockFinancialRepository()
	costingRepo := newMockCostingRepository()
	pricingRepo := newMockPricingRepository()
	svc := NewService(financialRepo, costingRepo, pricingRepo)
	ctx := context.Background()

	// 1. Setup prerequisite costing data and pricing results
	cd := &costing.CostData{
		CaseID:         "case-789",
		CompanyID:      "company-xyz",
		HPP:            1500000,
		Packaging:      80000,
		Certification:  120000,
		Transportation: 300000,
		Freight:        500000,
		Insurance:      100000,
		ExchangeRate:   16000,
		TargetMargin:   15.0,
		Quantity:       5000,
		PaymentTerm:    "T/T",
	}
	_ = costingRepo.Upsert(ctx, cd)

	pr := &pricing.PricingResult{
		CaseID:   "case-789",
		Incoterm: "CIF",
	}
	_ = pricingRepo.Upsert(ctx, pr)

	req := RecalculateRequest{
		Incoterm: "CIF",
	}

	res, err := svc.Recalculate(ctx, "case-789", "company-xyz", req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// CIF Cost per unit = 1.5M + 80k + 120k + 300k + 500k + 100k = 2.6M
	expectedCost := 2600000.0
	if res.TotalCostIDR != expectedCost {
		t.Errorf("expected CIF cost %.2f, got %.2f", expectedCost, res.TotalCostIDR)
	}

	// Selling Price = CIF Cost * 1.15 = 2.99M
	expectedPriceIDR := 2990000.0
	if res.SellingPriceIDR != expectedPriceIDR {
		t.Errorf("expected Selling Price IDR %.2f, got %.2f", expectedPriceIDR, res.SellingPriceIDR)
	}

	// Revenue = 2.99M * 5000 = 14,950,000,000
	expectedRevenue := 14950000000.0
	if res.RevenueIDR != expectedRevenue {
		t.Errorf("expected Revenue IDR %.2f, got %.2f", expectedRevenue, res.RevenueIDR)
	}

	// Gross Profit = Revenue - (Cost * 5000) = 14,950,000,000 - 13,000,000,000 = 1,950,000,000
	expectedProfit := 1950000000.0
	if res.GrossProfitIDR != expectedProfit {
		t.Errorf("expected Gross Profit IDR %.2f, got %.2f", expectedProfit, res.GrossProfitIDR)
	}

	// Margin % = (1,950M / 14,950M) * 100 = 13.04%
	if res.ProfitMarginPct != 13.04 {
		t.Errorf("expected Profit Margin 13.04%%, got %.2f%%", res.ProfitMarginPct)
	}

	// ROI % = (1,950M / 13,000M) * 100 = 15.00%
	if res.ROIPct != 15.00 {
		t.Errorf("expected ROI 15%%, got %.2f%%", res.ROIPct)
	}

	// Break-Even Quantity:
	// Fixed cost = Packaging + Certification + Transportation + Freight + Insurance = 80k + 120k + 300k + 500k + 100k = 1.1M
	// Contribution per unit = Price - HPP = 2.99M - 1.5M = 1.49M
	// Qty = 1.1M / 1.49M = 0.738... -> round2 -> 0.74
	if res.BreakEvenQty != 0.74 {
		t.Errorf("expected Break Even Qty 0.74, got %.2f", res.BreakEvenQty)
	}

	// Verify database persistence
	stored, err := financialRepo.GetByCaseID(ctx, "case-789")
	if err != nil {
		t.Fatalf("expected to find analysis in repo, got %v", err)
	}
	if stored.RevenueIDR != res.RevenueIDR {
		t.Errorf("stored Revenue IDR doesn't match")
	}
}

func TestRecalculate_PrerequisiteMissing(t *testing.T) {
	financialRepo := newMockFinancialRepository()
	costingRepo := newMockCostingRepository()
	pricingRepo := newMockPricingRepository()
	svc := NewService(financialRepo, costingRepo, pricingRepo)
	ctx := context.Background()

	// 1. Costing missing
	req := RecalculateRequest{Incoterm: "CIF"}
	_, err := svc.Recalculate(ctx, "case-888", "company-xyz", req)
	if err == nil {
		t.Fatalf("expected error when costing data is missing, got nil")
	}

	// 2. Costing exists, but pricing missing
	cd := &costing.CostData{
		CaseID:    "case-888",
		CompanyID: "company-xyz",
	}
	_ = costingRepo.Upsert(ctx, cd)

	_, err = svc.Recalculate(ctx, "case-888", "company-xyz", req)
	if err == nil {
		t.Fatalf("expected error when pricing data is missing, got nil")
	}
}
