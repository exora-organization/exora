package advisor

import "context"

// Repository handles persistence of advisor_recommendations.
// Single document per case using caseId as document ID (overwrite semantics).
type Repository interface {
	Upsert(ctx context.Context, rec *AdvisorRecommendation) error
	GetByCaseID(ctx context.Context, caseID string) (*AdvisorRecommendation, error)
	GetGlobal(ctx context.Context, companyID string) (*AdvisorRecommendation, error)
}
