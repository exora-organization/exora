package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/exora/backend/internal/apperror"
)

func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				slog.Error("panic recovered",
					"error", rec,
					"stack", string(debug.Stack()),
				)
				apperror.Write(w, apperror.ErrInternal)
			}
		}()
		next.ServeHTTP(w, r)
	})
}
