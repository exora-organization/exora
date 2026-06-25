package advisor

import "time"

// AdvisorRecommendation is the Firestore model for advisor_recommendations.
// Single document per export_case, overwritten on regenerate (SRS §9.1).
type AdvisorRecommendation struct {
	ID             string    `json:"-" firestore:"-"`
	CaseID         string    `json:"caseId" firestore:"caseId"`
	CompanyID      string    `json:"companyId" firestore:"companyId"`
	Answer         string    `json:"answer" firestore:"answer"`
	Sources        []string  `json:"sources,omitempty" firestore:"sources,omitempty"`
	Confidence     string    `json:"confidence" firestore:"confidence"`
	ContextSummary string    `json:"contextSummary,omitempty" firestore:"contextSummary,omitempty"`
	GeneratedAt    time.Time `json:"generatedAt" firestore:"generatedAt"`
}

// GenerateRequest is the optional request body for POST /advisor/recommendations.
type GenerateRequest struct {
	Question string `json:"question,omitempty" validate:"omitempty,min=5,max=2000"`
}
