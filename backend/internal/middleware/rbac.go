package middleware

import (
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
)

func RequireRoles(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			u, ok := actor.FromContext(r.Context())
			if !ok {
				apperror.Write(w, apperror.ErrUnauthenticated)
				return
			}
			if _, ok := allowed[u.Role]; !ok {
				apperror.Write(w, apperror.ErrForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
