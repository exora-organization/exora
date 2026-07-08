package risk

import (
	"context"
	"log/slog"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
	"google.golang.org/api/iterator"
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

func (r *FirestoreRepository) ListByCompany(ctx context.Context, companyID string) ([]*RiskAssessment, error) {
	q := r.client.Collection(collection).Where("companyId", "==", companyID)
	iter := q.Documents(ctx)
	var assessments []*RiskAssessment
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var ra RiskAssessment
		if err := doc.DataTo(&ra); err != nil {
			slog.Error("failed to decode risk assessment, skipping", "id", doc.Ref.ID, "error", err)
			continue
		}
		ra.ID = doc.Ref.ID
		assessments = append(assessments, &ra)
	}
	return assessments, nil
}

