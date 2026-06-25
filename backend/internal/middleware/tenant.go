package middleware

import (
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
)

type TenantResource interface {
	GetCompanyID() string
}

type TenantValidator func(r *http.Request, resourceID string) (TenantResource, error)

func RequireTenantAccess(paramName string, validate TenantValidator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			profile, ok := actor.FromContext(r.Context())
			if !ok {
				apperror.Write(w, apperror.ErrUnauthenticated)
				return
			}
			if profile.Role == "admin" {
				next.ServeHTTP(w, r)
				return
			}

			resourceID := r.PathValue(paramName)
			if resourceID == "" {
				apperror.Write(w, apperror.ErrValidation)
				return
			}

			resource, err := validate(r, resourceID)
			if err != nil {
				apperror.Write(w, err)
				return
			}
			if resource.GetCompanyID() != profile.CompanyID {
				apperror.Write(w, apperror.ErrForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
