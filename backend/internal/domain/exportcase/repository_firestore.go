package exportcase

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
	"google.golang.org/api/iterator"
)

const collection = "export_cases"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Create(ctx context.Context, c *ExportCase) error {
	now := time.Now().UTC()
	c.CreatedAt = now
	c.UpdatedAt = now
	if c.Status == "" {
		c.Status = StatusDraft
	}
	ref, _, err := r.client.Collection(collection).Add(ctx, c)
	if err != nil {
		return err
	}
	c.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) GetByID(ctx context.Context, id string) (*ExportCase, error) {
	doc, err := r.client.Collection(collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToCase(doc)
}

func (r *FirestoreRepository) ListByCompany(ctx context.Context, companyID string, limit int, cursor string) ([]*ExportCase, *string, error) {
	if limit <= 0 {
		limit = 20
	}
	q := r.client.Collection(collection).Where("companyId", "==", companyID).OrderBy("createdAt", firestore.Desc)
	if cursor != "" {
		if doc, err := r.client.Collection(collection).Doc(cursor).Get(ctx); err == nil {
			q = q.StartAfter(doc)
		}
	}
	q = q.Limit(limit + 1)
	iter := q.Documents(ctx)

	var cases []*ExportCase
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, nil, err
		}
		c, err := docToCase(doc)
		if err != nil {
			return nil, nil, err
		}
		cases = append(cases, c)
	}
	var next *string
	if len(cases) > limit {
		id := cases[limit-1].ID
		next = &id
		cases = cases[:limit]
	}
	return cases, next, nil
}

func (r *FirestoreRepository) Update(ctx context.Context, c *ExportCase) error {
	c.UpdatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(c.ID).Set(ctx, c)
	return err
}

func (r *FirestoreRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection(collection).Doc(id).Delete(ctx)
	return err
}

func (r *FirestoreRepository) Count(ctx context.Context) (int, error) {
	return countDocs(r.client.Collection(collection).Documents(ctx))
}

func (r *FirestoreRepository) CountByCompany(ctx context.Context, companyID string) (int, error) {
	if companyID == "" {
		return r.Count(ctx)
	}
	return countDocs(r.client.Collection(collection).Where("companyId", "==", companyID).Documents(ctx))
}

func (r *FirestoreRepository) CountByStatus(ctx context.Context, companyID, status string) (int, error) {
	q := r.client.Collection(collection).Where("status", "==", status)
	if companyID != "" {
		q = q.Where("companyId", "==", companyID)
	}
	return countDocs(q.Documents(ctx))
}

func docToCase(doc *firestore.DocumentSnapshot) (*ExportCase, error) {
	var c ExportCase
	if err := doc.DataTo(&c); err != nil {
		return nil, err
	}
	c.ID = doc.Ref.ID
	return &c, nil
}

func countDocs(iter *firestore.DocumentIterator) (int, error) {
	count := 0
	for {
		if _, err := iter.Next(); err != nil {
			break
		}
		count++
	}
	return count, nil
}
