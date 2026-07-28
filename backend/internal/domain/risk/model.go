package risk

import "time"

// Country risk levels.
const (
	CountryRiskLow    = "Low"
	CountryRiskMedium = "Medium"
	CountryRiskHigh   = "High"
)

// Payment term risk scores.
const (
	PaymentScoreLC            = 100.0
	PaymentScoreTT            = 75.0
	PaymentScoreDocCollection = 50.0
	PaymentScoreOpenAccount   = 25.0
)

// Country risk scores.
const (
	CountryScoreLow    = 100.0
	CountryScoreMedium = 60.0
	CountryScoreHigh   = 30.0
)

// Feasibility classifications.
const (
	FeasibilityHigh     = "High Feasibility"
	FeasibilityModerate = "Moderate Feasibility"
	FeasibilityLow      = "Low Feasibility"
)

// RiskAssessment is the model persisted to risk_assessments collection.
type RiskAssessment struct {
	ID                    string    `json:"-" firestore:"-"`
	CaseID                string    `json:"caseId" firestore:"caseId"`
	CompanyID             string    `json:"companyId" firestore:"companyId"`
	CountryRiskLevel      string    `json:"countryRiskLevel" firestore:"countryRiskLevel"`
	CountryRiskScore      float64   `json:"countryRiskScore" firestore:"countryRiskScore"`
	PaymentTerm           string    `json:"paymentTerm" firestore:"paymentTerm"`
	PaymentTermScore      float64   `json:"paymentTermScore" firestore:"paymentTermScore"`
	ProfitabilityScore    float64   `json:"profitabilityScore" firestore:"profitabilityScore"`
	FeasibilityScore      float64   `json:"feasibilityScore" firestore:"feasibilityScore"`
	FeasibilityClass      string    `json:"feasibilityClass" firestore:"feasibilityClass"`
	ActualMarginPct       float64   `json:"actualMarginPct" firestore:"actualMarginPct"`
	TargetMarginPct       float64   `json:"targetMarginPct" firestore:"targetMarginPct"`
	DestinationCountry    string    `json:"destinationCountry" firestore:"destinationCountry"`
	CalculatedAt          time.Time `json:"calculatedAt" firestore:"calculatedAt"`
}
