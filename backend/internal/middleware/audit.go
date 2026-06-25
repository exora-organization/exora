package middleware

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/exora/backend/internal/actor"
)

type AuditEntry struct {
	ActorID   string    `json:"actorId"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	Details   any       `json:"details,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

type AuditLogger interface {
	Log(ctx context.Context, entry AuditEntry) error
}

type auditResponseWriter struct {
	http.ResponseWriter
	status int
}

func (w *auditResponseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func Audit(action string, logger AuditLogger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			arw := &auditResponseWriter{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(arw, r)

			if arw.status >= 400 {
				return
			}

			u, ok := actor.FromContext(r.Context())
			if !ok {
				return
			}

			entry := AuditEntry{
				ActorID:   u.ID,
				Action:    action,
				Resource:  r.URL.Path,
				Timestamp: time.Now().UTC(),
			}

			if err := logger.Log(r.Context(), entry); err != nil {
				slog.Error("audit log failed", "error", err)
			}
		})
	}
}

func AuditJSON(w http.ResponseWriter, entry AuditEntry) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(entry)
}
