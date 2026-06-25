package scenario

import "context"

// Repository handles persistence of scenarios (multiple per export_case).
type Repository interface {
	Create(ctx context.Context, s *Scenario) error
	ListByCaseID(ctx context.Context, caseID string) ([]*Scenario, error)
	GetByIDs(ctx context.Context, caseID string, ids []string) ([]*Scenario, error)
}
