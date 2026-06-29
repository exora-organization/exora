package risk

import "context"

// Repository handles persistence of risk_assessments.
type Repository interface {
	Upsert(ctx context.Context, assessment *RiskAssessment) error
	GetByCaseID(ctx context.Context, caseID string) (*RiskAssessment, error)
	ListByCompany(ctx context.Context, companyID string) ([]*RiskAssessment, error)
}
