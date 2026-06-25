package risk

import "testing"

func TestRiskAssessments(t *testing.T) {
	// TC-BIZ-002: Profitability=75 (Actual margin is 18% vs target 20% margin -> 90% -> score 75)
	// Country = Low (Singapore -> score 100)
	// Payment Term = T/T (T/T -> score 80)
	// Weighted Score: (75 * 0.50) + (100 * 0.30) + (80 * 0.20) = 37.5 + 30 + 16 = 83.5 -> High Feasibility

	// 1. Country risk score
	level, score := countryRiskScore("Singapore")
	if level != CountryRiskLow || score != CountryScoreLow {
		t.Errorf("expected Singapore to have Low risk (100), got %s (%.1f)", level, score)
	}

	// 2. Payment term score
	payScore := paymentTermScore("T/T")
	if payScore != PaymentScoreTT {
		t.Errorf("expected T/T score to be 80, got %.1f", payScore)
	}

	// 3. Profitability score
	// Actual margin = 18%, Target margin = 20% -> Ratio = 90% -> score 75
	profScore := profitabilityScore(18.0, 20.0)
	if profScore != 75 {
		t.Errorf("expected actual/target ratio of 90%% to yield score of 75, got %.1f", profScore)
	}

	// 4. Feasibility classification
	feasibility := (profScore * 0.50) + (score * 0.30) + (payScore * 0.20)
	if feasibility != 83.5 {
		t.Errorf("expected weighted score of 83.5, got %.2f", feasibility)
	}
	class := classifyFeasibility(feasibility)
	if class != FeasibilityHigh {
		t.Errorf("expected 83.5 to classify as High Feasibility, got %s", class)
	}
}
