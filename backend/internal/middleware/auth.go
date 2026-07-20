package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/user"
)

type AuthMiddleware struct {
	users user.Repository
}

func NewAuthMiddleware(users user.Repository) *AuthMiddleware {
	return &AuthMiddleware{users: users}
}

func (m *AuthMiddleware) RequireProfile(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := actor.ClaimsFromContext(r.Context())
		if !ok {
			apperror.Write(w, apperror.ErrUnauthenticated)
			return
		}
		// Try lookup by Firebase UID first, then fall back to email.
		profile, err := m.users.GetByFirebaseUID(r.Context(), claims.UID)
		if err != nil {
			// Attempt email fallback when available
			if claims.Email != "" {
				profile, err = m.users.GetByEmail(r.Context(), claims.Email)
				if err == nil {
					profile.FirebaseUID = claims.UID
					_ = m.users.Update(r.Context(), profile)
				}
			}
			if err != nil {
				// failed both UID and email lookup
				apperror.Write(w, apperror.ErrUnauthenticated)
				return
			}
		}
		if profile.Status == user.StatusDisabled {
			apperror.Write(w, apperror.ErrAccountDisabled)
			return
		}

		ctx := actor.WithUser(r.Context(), &actor.User{
			ID:          profile.ID,
			FirebaseUID: profile.FirebaseUID,
			Email:       profile.Email,
			DisplayName: profile.DisplayName,
			Role:        profile.Role,
			CompanyID:   profile.CompanyID,
			Status:      profile.Status,
			CreatedAt:   profile.CreatedAt,
		})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *AuthMiddleware) VerifyTokenAndProfile(next http.Handler) http.Handler {
	return m.RequireProfile(next)
}

func (m *AuthMiddleware) RequireEmailVerified(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := actor.ClaimsFromContext(r.Context())
		if !ok {
			apperror.Write(w, apperror.ErrUnauthenticated)
			return
		}
		// Bypass email verification for existing accounts created before July 18, 2026
		if u, okUser := actor.FromContext(r.Context()); okUser {
			cutoffTime := time.Date(2026, time.July, 18, 0, 0, 0, 0, time.UTC)
			if u.CreatedAt.Before(cutoffTime) {
				next.ServeHTTP(w, r)
				return
			}
		}
		if !claims.EmailVerified && !strings.HasSuffix(strings.ToLower(claims.Email), "@exora.com") {
			apperror.Write(w, apperror.ErrEmailNotVerified)
			return
		}
		next.ServeHTTP(w, r)
	})
}
