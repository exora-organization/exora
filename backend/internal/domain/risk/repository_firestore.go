package risk

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "risk_assessments"

// FirestoreRepository persists risk_assessments using caseId as document ID.
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Upsert(ctx context.Context, assessment *RiskAssessment) error {
	assessment.CalculatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(assessment.CaseID).Set(ctx, assessment)
	return err
}

func (r *FirestoreRepository) GetByCaseID(ctx context.Context, caseID string) (*RiskAssessment, error) {
	doc, err := r.client.Collection(collection).Doc(caseID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var ra RiskAssessment
	if err := doc.DataTo(&ra); err != nil {
		return nil, apperror.ErrInternal
	}
	ra.ID = doc.Ref.ID
	return &ra, nil
}
