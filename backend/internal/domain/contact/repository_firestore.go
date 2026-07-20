package contact

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
)

const collection = "contact_messages"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) Save(ctx context.Context, msg *ContactMessage) error {
	msg.CreatedAt = time.Now().UTC()
	ref, _, err := r.client.Collection(collection).Add(ctx, msg)
	if err != nil {
		return err
	}
	msg.ID = ref.ID
	return nil
}
