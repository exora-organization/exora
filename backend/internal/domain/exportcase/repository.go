package exportcase

import "context"

type Repository interface {
	Create(ctx context.Context, c *ExportCase) error
	GetByID(ctx context.Context, id string) (*ExportCase, error)
	ListByCompany(ctx context.Context, companyID string, limit int, cursor string) ([]*ExportCase, *string, error)
	Update(ctx context.Context, c *ExportCase) error
	Delete(ctx context.Context, id string) error
	Count(ctx context.Context) (int, error)
	CountByCompany(ctx context.Context, companyID string) (int, error)
	CountByStatus(ctx context.Context, companyID, status string) (int, error)
}
