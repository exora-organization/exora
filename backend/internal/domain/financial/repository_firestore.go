package financial

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "financial_analysis"

// FirestoreRepository persists financial_analysis using caseId as document ID.
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Upsert(ctx context.Context, analysis *FinancialAnalysis) error {
	analysis.CalculatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(analysis.CaseID).Set(ctx, analysis)
	return err
}

func (r *FirestoreRepository) GetByCaseID(ctx context.Context, caseID string) (*FinancialAnalysis, error) {
	doc, err := r.client.Collection(collection).Doc(caseID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var fa FinancialAnalysis
	if err := doc.DataTo(&fa); err != nil {
		return nil, apperror.ErrInternal
	}
	fa.ID = doc.Ref.ID
	return &fa, nil
}
