package middleware

import (
	"net/http"
	"strings"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/platform/firebaseauth"
)

type FirebaseMiddleware struct {
	firebase *firebaseauth.Client
}

func NewFirebaseMiddleware(firebase *firebaseauth.Client) *FirebaseMiddleware {
	return &FirebaseMiddleware{firebase: firebase}
}

func (m *FirebaseMiddleware) VerifyToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, err := extractBearerToken(r)
		if err != nil {
			apperror.Write(w, err)
			return
		}

		verified, err := m.firebase.VerifyIDToken(r.Context(), token)
		if err != nil {
			apperror.Write(w, apperror.ErrUnauthenticated)
			return
		}

		email, _ := verified.Claims["email"].(string)
		ctx := actor.WithClaims(r.Context(), &actor.FirebaseClaims{
			UID:   verified.UID,
			Email: email,
		})
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func extractBearerToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", apperror.ErrUnauthenticated
	}
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || parts[1] == "" {
		return "", apperror.ErrUnauthenticated
	}
	return parts[1], nil
}
