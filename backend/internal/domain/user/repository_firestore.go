package user

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/apperror"
)

const collection = "users"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) GetByID(ctx context.Context, id string) (*User, error) {
	doc, err := r.client.Collection(collection).Doc(id).Get(ctx)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToUser(doc)
}

func (r *FirestoreRepository) GetByFirebaseUID(ctx context.Context, firebaseUID string) (*User, error) {
	iter := r.client.Collection(collection).Where("firebaseUid", "==", firebaseUID).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToUser(doc)
}

func (r *FirestoreRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	iter := r.client.Collection(collection).Where("email", "==", email).Limit(1).Documents(ctx)
	doc, err := iter.Next()
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	return docToUser(doc)
}

func (r *FirestoreRepository) ListByCompany(ctx context.Context, companyID string) ([]*User, error) {
	iter := r.client.Collection(collection).Where("companyId", "==", companyID).Documents(ctx)
	return collectUsers(iter)
}

func (r *FirestoreRepository) ListAll(ctx context.Context, companyIDFilter string) ([]*User, error) {
	if companyIDFilter != "" {
		return collectUsers(r.client.Collection(collection).Where("companyId", "==", companyIDFilter).Documents(ctx))
	}
	return collectUsers(r.client.Collection(collection).Documents(ctx))
}

func (r *FirestoreRepository) Create(ctx context.Context, user *User) error {
	now := time.Now().UTC()
	user.CreatedAt = now
	user.UpdatedAt = now
	if user.Status == "" {
		user.Status = StatusActive
	}
	ref, _, err := r.client.Collection(collection).Add(ctx, user)
	if err != nil {
		return err
	}
	user.ID = ref.ID
	return nil
}

func (r *FirestoreRepository) Update(ctx context.Context, user *User) error {
	user.UpdatedAt = time.Now().UTC()
	_, err := r.client.Collection(collection).Doc(user.ID).Set(ctx, user)
	return err
}

func (r *FirestoreRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.Collection(collection).Doc(id).Delete(ctx)
	return err
}

func (r *FirestoreRepository) Count(ctx context.Context) (int, error) {
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

func docToUser(doc *firestore.DocumentSnapshot) (*User, error) {
	var u User
	if err := doc.DataTo(&u); err != nil {
		return nil, err
	}
	u.ID = doc.Ref.ID
	if u.Status == "" {
		u.Status = StatusActive
	}
	return &u, nil
}

func collectUsers(iter *firestore.DocumentIterator) ([]*User, error) {
	var users []*User
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		u, err := docToUser(doc)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
