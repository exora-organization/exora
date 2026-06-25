package risk

import (
	"context"
	"strings"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/pricing"
)

// Service handles SRS FR-015 risk assessment and FR-016 feasibility scoring.
// GetAssessment auto-derives all risk components from stored data — no manual input required.
// Per API Contract v2 §11: only GET endpoint exists; auto-calculates and stores on every call.
type Service struct {
	repo        Repository
	costingRepo costing.Repository
	pricingRepo pricing.Repository
	caseRepo    exportcase.Repository
}

func NewService(repo Repository, costingRepo costing.Repository, pricingRepo pricing.Repository, caseRepo exportcase.Repository) *Service {
	return &Service{
		repo:        repo,
		costingRepo: costingRepo,
		pricingRepo: pricingRepo,
		caseRepo:    caseRepo,
	}
}

// GetAssessment auto-calculates risk from stored data and persists.
// Always recalculates to reflect latest cost/pricing changes.
func (s *Service) GetAssessment(ctx context.Context, caseID, companyID string) (*RiskAssessment, error) {
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data required for risk assessment", 422)
	}

	pr, err := s.pricingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: pricing_results required for risk assessment", 422)
	}

	ec, err := s.caseRepo.GetByID(ctx, caseID)
	if err != nil {
		return nil, err
	}

	// --- SRS §5.3 Component Scoring ---

	// 1. Country Risk — derived from destination country
	countryRiskLevel, countryScore := countryRiskScore(ec.DestinationCountry)

	// 2. Payment Term Risk — from cost_data.paymentTerm
	paymentScore := paymentTermScore(cd.PaymentTerm)

	// 3. Profitability Risk — actual margin vs target margin
	actualMargin := pr.ActualMarginPct
	targetMargin := cd.TargetMargin
	profitScore := profitabilityScore(actualMargin, targetMargin)

	// --- SRS §5.4 Feasibility Formula ---
	// Feasibility Score = (Profitability × 0.50) + (Country Risk × 0.30) + (Payment Term × 0.20)
	feasibility := (profitScore * 0.50) + (countryScore * 0.30) + (paymentScore * 0.20)
	feasibility = round2(feasibility)

	feasClass := classifyFeasibility(feasibility)

	assessment := &RiskAssessment{
		CaseID:             caseID,
		CompanyID:          companyID,
		CountryRiskLevel:   countryRiskLevel,
		CountryRiskScore:   countryScore,
		PaymentTerm:        cd.PaymentTerm,
		PaymentTermScore:   paymentScore,
		ProfitabilityScore: profitScore,
		FeasibilityScore:   feasibility,
		FeasibilityClass:   feasClass,
		ActualMarginPct:    actualMargin,
		TargetMarginPct:    targetMargin,
		DestinationCountry: ec.DestinationCountry,
	}

	// Persist (upsert — overwrite on recalculate)
	_ = s.repo.Upsert(ctx, assessment)

	return assessment, nil
}

// countryRiskScore maps a destination country to SRS risk level + score.
// The 10 SRS countries are explicitly mapped; unknown countries default to Medium.
func countryRiskScore(country string) (string, float64) {
	c := strings.ToLower(strings.TrimSpace(country))
	switch c {
	case "singapore", "singapura":
		return CountryRiskLow, CountryScoreLow
	case "japan", "jepang":
		return CountryRiskLow, CountryScoreLow
	case "south korea", "korea selatan":
		return CountryRiskLow, CountryScoreLow
	case "united states", "usa", "us", "amerika serikat":
		return CountryRiskLow, CountryScoreLow
	case "uae", "united arab emirates":
		return CountryRiskLow, CountryScoreLow
	case "malaysia":
		return CountryRiskMedium, CountryScoreMedium
	case "thailand":
		return CountryRiskMedium, CountryScoreMedium
	case "vietnam":
		return CountryRiskMedium, CountryScoreMedium
	case "china", "tiongkok":
		return CountryRiskMedium, CountryScoreMedium
	case "india":
		return CountryRiskMedium, CountryScoreMedium
	}
	return CountryRiskMedium, CountryScoreMedium
}

// paymentTermScore maps payment term to SRS risk score.
func paymentTermScore(term string) float64 {
	switch term {
	case "L/C":
		return PaymentScoreLC
	case "T/T":
		return PaymentScoreTT
	case "Doc. Collection":
		return PaymentScoreDocCollection
	case "Open Account":
		return PaymentScoreOpenAccount
	}
	return PaymentScoreTT // default
}

// profitabilityScore maps (actualMargin / targetMargin) ratio to SRS score.
func profitabilityScore(actual, target float64) float64 {
	if target <= 0 {
		return 25
	}
	ratio := (actual / target) * 100
	switch {
	case ratio >= 100:
		return 100
	case ratio >= 80:
		return 75
	case ratio >= 50:
		return 50
	default:
		return 25
	}
}

// classifyFeasibility maps a score to SRS feasibility classification.
// TC-BIZ-002: score=83.5 → High Feasibility ✓
func classifyFeasibility(score float64) string {
	switch {
	case score >= 80:
		return FeasibilityHigh
	case score >= 60:
		return FeasibilityModerate
	default:
		return FeasibilityLow
	}
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
