package pricing

import "context"

// Repository handles persistence of pricing_results.
// Upsert overwrites on every recalculation (SRS: "Overwrite on recalculate").
type Repository interface {
	Upsert(ctx context.Context, result *PricingResult) error
	GetByCaseID(ctx context.Context, caseID string) (*PricingResult, error)
}
