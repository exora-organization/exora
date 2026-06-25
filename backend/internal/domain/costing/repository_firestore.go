package costing

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "cost_data"

// FirestoreRepository implements Repository using Cloud Firestore.
// The document ID is the caseId for easy 1:1 lookup.
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

// Upsert creates or overwrites cost data for a given case.
func (r *FirestoreRepository) Upsert(ctx context.Context, data *CostData) error {
	now := time.Now().UTC()
	if data.CreatedAt.IsZero() {
		data.CreatedAt = now
	}
	data.UpdatedAt = now
	_, err := r.client.Collection(collection).Doc(data.CaseID).Set(ctx, data)
	return err
}

// GetByCaseID retrieves cost data for an export case.
func (r *FirestoreRepository) GetByCaseID(ctx context.Context, caseID string) (*CostData, error) {
	doc, err := r.client.Collection(collection).Doc(caseID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var d CostData
	if err := doc.DataTo(&d); err != nil {
		return nil, apperror.ErrInternal
	}
	d.ID = doc.Ref.ID
	return &d, nil
}
