package company

import (
	"context"
	"sort"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
	"google.golang.org/api/iterator"
)

const collection = "companies"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Create(ctx context.Context, c *Company) error {
	now := time.Now().UTC()
	c.SubmittedAt = now
	c.UpdatedAt = now
	c.Status = StatusPending
	ref, _, err := r.client.Collection(collection).Add(ctx, c)
	if err != nil {
		return err
	}
	c.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) GetByID(ctx context.Context, id string) (*Company, error) {
	doc, err := r.client.Collection(collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToCompany(doc)
}

func (r *FirestoreRepository) GetByApplicantUserID(ctx context.Context, userID string) (*Company, error) {
	iter := r.client.Collection(collection).Where("applicantUserId", "==", userID).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToCompany(doc)
}

func (r *FirestoreRepository) Update(ctx context.Context, c *Company) error {
	c.UpdatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(c.ID).Set(ctx, c)
	return err
}

func (r *FirestoreRepository) List(ctx context.Context, status string, limit int, cursor string) ([]*Company, *string, error) {
	if limit <= 0 {
		limit = 20
	}
	
	var q firestore.Query
	if status != "" {
		q = r.client.Collection(collection).Where("status", "==", status)
	} else {
		q = r.client.Collection(collection).Query
	}

	iter := q.Documents(ctx)
	var companies []*Company
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, nil, err
		}
		c, err := docToCompany(doc)
		if err != nil {
			return nil, nil, err
		}
		companies = append(companies, c)
	}

	// Sort in memory by submittedAt DESC to avoid composite index requirements
	sort.Slice(companies, func(i, j int) bool {
		return companies[i].SubmittedAt.After(companies[j].SubmittedAt)
	})

	// Apply cursor in memory
	if cursor != "" {
		startIndex := -1
		for i, c := range companies {
			if c.ID == cursor {
				startIndex = i + 1
				break
			}
		}
		if startIndex != -1 && startIndex < len(companies) {
			companies = companies[startIndex:]
		} else if startIndex >= len(companies) {
			companies = nil
		}
	}

	var nextCursor *string
	if len(companies) > limit {
		last := companies[limit-1].ID
		nextCursor = &last
		companies = companies[:limit]
	}
	return companies, nextCursor, nil
}

func (r *FirestoreRepository) CountByStatus(ctx context.Context, status string) (int, error) {
	iter := r.client.Collection(collection).Where("status", "==", status).Documents(ctx)
	count := 0
	for {
		if _, err := iter.Next(); err != nil {
			break
		}
		count++
	}
	return count, nil
}

func (r *FirestoreRepository) CountAll(ctx context.Context) (int, error) {
	iter := r.client.Collection(collection).Documents(ctx)
	count := 0
	for {
		if _, err := iter.Next(); err != nil {
			break
		}
		count++
	}
	return count, nil
}

func docToCompany(doc *firestore.DocumentSnapshot) (*Company, error) {
	var c Company
	if err := doc.DataTo(&c); err != nil {
		return nil, err
	}
	c.ID = doc.Ref.ID
	return &c, nil
}

func ToApplyResponse(c *Company) ApplyResponse {
	resp := ApplyResponse{
		CompanyID:      c.ID,
		CompanyName:    c.CompanyName,
		BusinessSector: c.BusinessSector,
		Country:        c.Country,
		Status:         c.Status,
		SubmittedAt:    c.SubmittedAt.UTC().Format(time.RFC3339),
	}
	if c.ApprovedAt != nil {
		s := c.ApprovedAt.UTC().Format(time.RFC3339)
		resp.ApprovedAt = &s
	}
	return resp
}

func ToStatusResponse(c *Company) ApplicationStatusResponse {
	resp := ApplicationStatusResponse{Status: "none"}
	if c == nil {
		return resp
	}
	id, name := c.ID, c.CompanyName
	sector, country := c.BusinessSector, c.Country
	submitted := c.SubmittedAt.UTC().Format(time.RFC3339)
	resp.CompanyID = &id
	resp.CompanyName = &name
	resp.BusinessSector = &sector
	resp.Country = &country
	resp.Status = c.Status
	resp.SubmittedAt = &submitted
	if c.ApprovedAt != nil {
		s := c.ApprovedAt.UTC().Format(time.RFC3339)
		resp.ApprovedAt = &s
	}
	if c.RevisionNotes != "" {
		resp.RevisionNotes = &c.RevisionNotes
	}
	return resp
}
