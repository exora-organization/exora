package admin

import (
	"context"
	"time"

	"github.com/exora/backend/internal/middleware"
)

type Repository interface {
	LogAudit(ctx context.Context, entry AuditLog) error
	CountUsers(ctx context.Context) (int, error)
	CountPendingApplications(ctx context.Context) (int, error)
	CountExportCases(ctx context.Context) (int, error)
	CountAIRecommendations(ctx context.Context) (int, error)
	ListAuditLogs(ctx context.Context, limit int) ([]AuditLog, error)
	CountAuditLogsByAction(ctx context.Context, action string, since time.Time) (int, error)
	CountExportCasesSince(ctx context.Context, since time.Time) (int, error)
}

type AuditRepository struct {
	Repo Repository
}

func (a *AuditRepository) Log(ctx context.Context, entry middleware.AuditEntry) error {
	return a.Repo.LogAudit(ctx, AuditLog{
		ActorID:   entry.ActorID,
		Action:    entry.Action,
		Resource:  entry.Resource,
		Details:   entry.Details,
		Timestamp: entry.Timestamp,
	})
}
