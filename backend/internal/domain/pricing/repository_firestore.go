package pricing

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "pricing_results"

// FirestoreRepository persists pricing_results using caseId as document ID.
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

// Upsert creates or overwrites the pricing result for a case.
func (r *FirestoreRepository) Upsert(ctx context.Context, result *PricingResult) error {
	result.CalculatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(result.CaseID).Set(ctx, result)
	return err
}

// GetByCaseID retrieves the latest pricing result for a case.
func (r *FirestoreRepository) GetByCaseID(ctx context.Context, caseID string) (*PricingResult, error) {
	doc, err := r.client.Collection(collection).Doc(caseID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var p PricingResult
	if err := doc.DataTo(&p); err != nil {
		return nil, apperror.ErrInternal
	}
	p.ID = doc.Ref.ID
	return &p, nil
}
