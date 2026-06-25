package pricing

import (
	"testing"

	"github.com/exora/backend/internal/domain/costing"
)

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
