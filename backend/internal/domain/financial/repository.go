package financial

import "context"

// Repository handles persistence of financial_analysis.
type Repository interface {
	Upsert(ctx context.Context, analysis *FinancialAnalysis) error
	GetByCaseID(ctx context.Context, caseID string) (*FinancialAnalysis, error)
}
