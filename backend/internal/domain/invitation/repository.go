package invitation

import "context"

type Repository interface {
	Create(ctx context.Context, inv *Invitation) error
	GetByID(ctx context.Context, id string) (*Invitation, error)
	GetByToken(ctx context.Context, token string) (*Invitation, error)
	GetPendingByEmail(ctx context.Context, email string) (*Invitation, error)
	GetPendingByEmailAndCompany(ctx context.Context, email, companyID string) (*Invitation, error)
	ListPendingByCompany(ctx context.Context, companyID string) ([]*Invitation, error)
	Update(ctx context.Context, inv *Invitation) error
	Delete(ctx context.Context, id string) error
}
