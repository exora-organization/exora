package contact

import "context"

type Repository interface {
	Save(ctx context.Context, msg *ContactMessage) error
}
