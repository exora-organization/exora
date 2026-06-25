package document

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
	"google.golang.org/api/iterator"
)

const collection = "documents"

// FirestoreRepository persists document metadata (not content — content is generated on demand).
type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Create(ctx context.Context, doc *Document) error {
	doc.GeneratedAt = time.Now().UTC()
	ref, _, err := r.client.Collection(collection).Add(ctx, doc)
	if err != nil {
		return err
	}
	doc.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) ListByCaseID(ctx context.Context, caseID string) ([]*Document, error) {
	iter := r.client.Collection(collection).
		Where("caseId", "==", caseID).
		OrderBy("generatedAt", firestore.Desc).
		Documents(ctx)

	var docs []*Document
	for {
		snap, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var d Document
		if err := snap.DataTo(&d); err != nil {
			continue
		}
		d.ID = snap.Ref.ID
		docs = append(docs, &d)
	}
	return docs, nil
}

func (r *FirestoreRepository) GetByID(ctx context.Context, documentID string) (*Document, error) {
	doc, err := r.client.Collection(collection).Doc(documentID).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	var d Document
	if err := doc.DataTo(&d); err != nil {
		return nil, apperror.ErrInternal
	}
	d.ID = doc.Ref.ID
	return &d, nil
}
