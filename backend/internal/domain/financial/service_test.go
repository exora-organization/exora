package financial

import (
	"testing"

	"github.com/exora/backend/internal/domain/costing"
)

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
