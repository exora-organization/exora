package middleware

import (
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
)

// RequireRoles is an RBAC middleware that restricts route access to specific roles.
// It retrieves the authenticated user profile from the request context, checks if their role
// matches one of the allowed roles, and returns a 403 Forbidden error if they are unauthorized.
func RequireRoles(roles ...string) func(http.Handler) http.Handler {
	// Initialize a map for O(1) role lookup during request parsing
	allowed := make(map[string]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract parsed actor profile from request context
			u, ok := actor.FromContext(r.Context())
			if !ok {
				apperror.Write(w, apperror.ErrUnauthenticated)
				return
			}
			
			// Validate if the actor's role is allowed
			if _, ok := allowed[u.Role]; !ok {
				apperror.Write(w, apperror.ErrForbidden)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}
