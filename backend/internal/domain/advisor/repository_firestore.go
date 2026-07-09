package advisor

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "advisor_recommendations"

// FirestoreRepository persists advisor_recommendations using caseId as document ID.
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Upsert(ctx context.Context, rec *AdvisorRecommendation) error {
	rec.GeneratedAt = time.Now().UTC()
	docID := rec.CaseID
	if docID == "global" {
		docID = fmt.Sprintf("global-%s", rec.CompanyID)
	}
	_, err := r.client.Collection(collection).Doc(docID).Set(ctx, rec)
	return err
}

func (r *FirestoreRepository) GetByCaseID(ctx context.Context, caseID string) (*AdvisorRecommendation, error) {
	doc, err := r.client.Collection(collection).Doc(caseID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var rec AdvisorRecommendation
	if err := doc.DataTo(&rec); err != nil {
		return nil, apperror.ErrInternal
	}
	rec.ID = doc.Ref.ID
	return &rec, nil
}

func (r *FirestoreRepository) GetGlobal(ctx context.Context, companyID string) (*AdvisorRecommendation, error) {
	docID := fmt.Sprintf("global-%s", companyID)
	doc, err := r.client.Collection(collection).Doc(docID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var rec AdvisorRecommendation
	if err := doc.DataTo(&rec); err != nil {
		return nil, apperror.ErrInternal
	}
	rec.ID = doc.Ref.ID
	return &rec, nil
}

