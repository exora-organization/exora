package costing

import "context"

// Repository handles persistence of cost_data.
type Repository interface {
	Upsert(ctx context.Context, data *CostData) error
	GetByCaseID(ctx context.Context, caseID string) (*CostData, error)
}
