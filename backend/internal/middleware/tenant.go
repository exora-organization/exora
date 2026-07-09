package middleware

import (
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
)

// TenantResource defines an interface for any resource that belongs to a specific company/tenant.
type TenantResource interface {
	GetCompanyID() string
}

// TenantValidator is a callback type used to lookup and validate a resource by its ID.
type TenantValidator func(r *http.Request, resourceID string) (TenantResource, error)

// RequireTenantAccess is a middleware that enforces company-level tenant isolation.
// It verifies that the authenticated user belongs to the same company as the requested resource.
// Note: System administrators ('admin' role) bypass this check to allow global operations.
func RequireTenantAccess(paramName string, validate TenantValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract user profile context
			profile, ok := actor.FromContext(r.Context())
			if !ok {
				apperror.Write(w, apperror.ErrUnauthenticated)
				return
			}
			
			// Admin bypass rule
			if profile.Role == "admin" {
				next.ServeHTTP(w, r)
				return
			}

			// Extract resource ID from path parameters
			resourceID := r.PathValue(paramName)
			if resourceID == "" {
				apperror.Write(w, apperror.ErrValidation)
				return
			}

			// Retrieve and validate target tenant resource
			resource, err := validate(r, resourceID)
			if err != nil {
				apperror.Write(w, err)
				return
			}
			
			// Enforce tenant company matching rule
			if resource.GetCompanyID() != profile.CompanyID {
				apperror.Write(w, apperror.ErrForbidden)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}
