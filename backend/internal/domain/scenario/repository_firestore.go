package scenario

import (
	"context"
	"sort"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
	"google.golang.org/api/iterator"
)

const collection = "scenarios"

// FirestoreRepository persists scenarios with auto-generated document IDs
// (multiple scenarios per case).
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Create(ctx context.Context, s *Scenario) error {
	s.CreatedAt = time.Now().UTC()
	ref, _, err := r.client.Collection(collection).Add(ctx, s)
	if err != nil {
		return err
	}
	s.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) ListByCaseID(ctx context.Context, caseID string) ([]*Scenario, error) {
	iter := r.client.Collection(collection).
		Where("caseId", "==", caseID).
		Documents(ctx)

	var results []*Scenario
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var s Scenario
		if err := doc.DataTo(&s); err != nil {
			continue
		}
		s.ID = doc.Ref.ID
		results = append(results, &s)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].CreatedAt.After(results[j].CreatedAt)
	})

	return results, nil
}

func (r *FirestoreRepository) GetByIDs(ctx context.Context, caseID string, ids []string) ([]*Scenario, error) {
	if len(ids) == 0 {
		return nil, apperror.ErrValidation
	}
	var results []*Scenario
	for _, id := range ids {
		doc, err := r.client.Collection(collection).Doc(id).Get(ctx)
		if err != nil {
			continue
		}
		var s Scenario
		if err := doc.DataTo(&s); err != nil {
			continue
		}
		// Validate scenario belongs to this case (tenant isolation)
		if s.CaseID != caseID {
			continue
		}
		s.ID = doc.Ref.ID
		results = append(results, &s)
	}
	return results, nil
}

func (r *FirestoreRepository) Update(ctx context.Context, scenarioID string, updates map[string]any) error {
	var firestoreUpdates []firestore.Update
	for k, v := range updates {
		firestoreUpdates = append(firestoreUpdates, firestore.Update{Path: k, Value: v})
	}
	_, err := r.client.Collection(collection).Doc(scenarioID).Update(ctx, firestoreUpdates)
	return err
}

func (r *FirestoreRepository) Delete(ctx context.Context, scenarioID string) error {
	_, err := r.client.Collection(collection).Doc(scenarioID).Delete(ctx)
	return err
}
