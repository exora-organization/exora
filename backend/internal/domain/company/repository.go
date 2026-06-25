package company

import "context"

type Repository interface {
	Create(ctx context.Context, c *Company) error
	GetByID(ctx context.Context, id string) (*Company, error)
	GetByApplicantUserID(ctx context.Context, userID string) (*Company, error)
	Update(ctx context.Context, c *Company) error
	List(ctx context.Context, status string, limit int, cursor string) ([]*Company, *string, error)
	CountByStatus(ctx context.Context, status string) (int, error)
	CountAll(ctx context.Context) (int, error)
}
