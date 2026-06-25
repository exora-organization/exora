package document

import "context"

// Repository handles persistence of document metadata.
type Repository interface {
	Create(ctx context.Context, doc *Document) error
	ListByCaseID(ctx context.Context, caseID string) ([]*Document, error)
	GetByID(ctx context.Context, documentID string) (*Document, error)
}
