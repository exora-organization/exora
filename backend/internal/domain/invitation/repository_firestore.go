package invitation

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "invitations"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Create(ctx context.Context, inv *Invitation) error {
	now := time.Now().UTC()
	inv.CreatedAt = now
	ref, _, err := r.client.Collection(collection).Add(ctx, inv)
	if err != nil {
		return err
	}
	inv.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) GetByID(ctx context.Context, id string) (*Invitation, error) {
	doc, err := r.client.Collection(collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToInvitation(doc)
}

func (r *FirestoreRepository) GetByToken(ctx context.Context, token string) (*Invitation, error) {
	iter := r.client.Collection(collection).Where("token", "==", token).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToInvitation(doc)
}

func (r *FirestoreRepository) ListPendingByCompany(ctx context.Context, companyID string) ([]*Invitation, error) {
	iter := r.client.Collection(collection).
		Where("companyId", "==", companyID).
		Where("status", "==", StatusPending).
		Documents(ctx)
	var invs []*Invitation
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		inv, err := docToInvitation(doc)
		if err != nil {
			return nil, err
		}
		invs = append(invs, inv)
	}
	return invs, nil
}

func (r *FirestoreRepository) Update(ctx context.Context, inv *Invitation) error {
	_, err := r.client.Collection(collection).Doc(inv.ID).Set(ctx, inv)
	return err
}

func docToInvitation(doc *firestore.DocumentSnapshot) (*Invitation, error) {
	var inv Invitation
	if err := doc.DataTo(&inv); err != nil {
		return nil, err
	}
	inv.ID = doc.Ref.ID
	return &inv, nil
}
