package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/domain/user"
)

type stubUserRepo struct {
	profile *user.User
	err     error
}

func (s *stubUserRepo) GetByID(context.Context, string) (*user.User, error) { return nil, nil }
func (s *stubUserRepo) GetByFirebaseUID(context.Context, string) (*user.User, error) {
	if s.err != nil {
		return nil, s.err
	}
	return s.profile, nil
}
func (s *stubUserRepo) GetByEmail(context.Context, string) (*user.User, error) { return nil, nil }
func (s *stubUserRepo) ListByCompany(context.Context, string) ([]*user.User, error) {
	return nil, nil
}
func (s *stubUserRepo) ListAll(context.Context, string) ([]*user.User, error) { return nil, nil }
func (s *stubUserRepo) Create(context.Context, *user.User) error              { return nil }
func (s *stubUserRepo) Update(context.Context, *user.User) error              { return nil }
func (s *stubUserRepo) Delete(context.Context, string) error                  { return nil }
func (s *stubUserRepo) Count(context.Context) (int, error)                    { return 0, nil }

func TestRequireProfileRejectsDisabledUsers(t *testing.T) {
	repo := &stubUserRepo{profile: &user.User{ID: "u1", FirebaseUID: "uid", Email: "a@example.com", Role: user.RoleGuest, Status: user.StatusDisabled}}
	mw := NewAuthMiddleware(repo)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{UID: "uid"}))
	rr := httptest.NewRecorder()

	mw.RequireProfile(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatalf("handler should not run for disabled users")
	})).ServeHTTP(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for disabled user, got %d", rr.Code)
	}
}
