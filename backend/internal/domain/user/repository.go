package user

import "context"

type Repository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	GetByFirebaseUID(ctx context.Context, firebaseUID string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	ListByCompany(ctx context.Context, companyID string) ([]*User, error)
	ListAll(ctx context.Context, companyIDFilter string) ([]*User, error)
	Create(ctx context.Context, user *User) error
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id string) error
	Count(ctx context.Context) (int, error)
}
