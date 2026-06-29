package admin

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
)

const auditCollection = "audit_logs"

type FirestoreRepository struct {
	client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{client: client}
}

func (r *FirestoreRepository) LogAudit(ctx context.Context, entry AuditLog) error {
	entry.Timestamp = time.Now().UTC()
	_, _, err := r.client.Collection(auditCollection).Add(ctx, entry)
	return err
}

func (r *FirestoreRepository) CountUsers(ctx context.Context) (int, error) {
	return countDocs(r.client.Collection("users").Documents(ctx))
}

func (r *FirestoreRepository) CountPendingApplications(ctx context.Context) (int, error) {
	return countDocs(r.client.Collection("companies").Where("status", "==", "pending").Documents(ctx))
}

func (r *FirestoreRepository) CountExportCases(ctx context.Context) (int, error) {
	return countDocs(r.client.Collection("export_cases").Documents(ctx))
}

func (r *FirestoreRepository) CountAIRecommendations(ctx context.Context) (int, error) {
	return countDocs(r.client.Collection("advisor_recommendations").Documents(ctx))
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

func (r *FirestoreRepository) ListAuditLogs(ctx context.Context, limit int) ([]AuditLog, error) {
	if limit <= 0 {
		limit = 100
	}
	var logs []AuditLog
	docs, err := r.client.Collection(auditCollection).OrderBy("timestamp", firestore.Desc).Limit(limit).Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}
	for _, doc := range docs {
		var entry AuditLog
		if err := doc.DataTo(&entry); err == nil {
			entry.ID = doc.Ref.ID
			logs = append(logs, entry)
		}
	}
	return logs, nil
}

