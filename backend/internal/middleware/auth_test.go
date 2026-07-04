package middleware

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/user"
)

// stubUserRepo implements user.Repository for testing
type stubUserRepo struct {
	userByUID   *user.User
	userByEmail *user.User
	errByUID    error
	errByEmail  error
	updatedUser *user.User
}

func (s *stubUserRepo) GetByID(context.Context, string) (*user.User, error) {
	if s.userByUID != nil {
		return s.userByUID, nil
	}
	return nil, errors.New("not found")
}

func (s *stubUserRepo) GetByFirebaseUID(ctx context.Context, uid string) (*user.User, error) {
	if s.errByUID != nil {
		return nil, s.errByUID
	}
	if s.userByUID != nil && s.userByUID.FirebaseUID == uid {
		return s.userByUID, nil
	}
	return nil, errors.New("not found")
}

func (s *stubUserRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	if s.errByEmail != nil {
		return nil, s.errByEmail
	}
	if s.userByEmail != nil && s.userByEmail.Email == email {
		return s.userByEmail, nil
	}
	return nil, errors.New("not found")
}

func (s *stubUserRepo) ListByCompany(context.Context, string) ([]*user.User, error) { return nil, nil }
func (s *stubUserRepo) ListAll(context.Context, string) ([]*user.User, error)     { return nil, nil }
func (s *stubUserRepo) Create(context.Context, *user.User) error                 { return nil }
func (s *stubUserRepo) Update(ctx context.Context, u *user.User) error {
	s.updatedUser = u
	return nil
}
func (s *stubUserRepo) Delete(context.Context, string) error { return nil }
func (s *stubUserRepo) Count(context.Context) (int, error)   { return 0, nil }

// mockResource implements TenantResource for testing
type mockResource struct {
	companyID string
}

func (m *mockResource) GetCompanyID() string {
	return m.companyID
}

func TestRequireProfile(t *testing.T) {
	t.Run("Active user profile found by UID", func(t *testing.T) {
		repo := &stubUserRepo{
			userByUID: &user.User{
				ID:          "user-1",
				FirebaseUID: "uid-1",
				Email:       "test@example.com",
				Role:        user.RoleGuest,
				Status:      user.StatusActive,
				CompanyID:   "company-1",
			},
		}
		mw := NewAuthMiddleware(repo)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{UID: "uid-1"}))
		rr := httptest.NewRecorder()

		var invoked bool
		mw.RequireProfile(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
			u, ok := actor.FromContext(r.Context())
			if !ok {
				t.Fatal("expected user to be in context")
			}
			if u.ID != "user-1" || u.CompanyID != "company-1" {
				t.Errorf("unexpected user in context: %+v", u)
			}
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
		if rr.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", rr.Code)
		}
	})

	t.Run("Disabled user profile returns Forbidden", func(t *testing.T) {
		repo := &stubUserRepo{
			userByUID: &user.User{
				ID:          "user-1",
				FirebaseUID: "uid-1",
				Role:        user.RoleGuest,
				Status:      user.StatusDisabled,
			},
		}
		mw := NewAuthMiddleware(repo)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{UID: "uid-1"}))
		rr := httptest.NewRecorder()

		mw.RequireProfile(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", rr.Code)
		}
	})

	t.Run("Missing actor claims returns Unauthorized", func(t *testing.T) {
		repo := &stubUserRepo{}
		mw := NewAuthMiddleware(repo)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rr := httptest.NewRecorder()

		mw.RequireProfile(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected 401, got %d", rr.Code)
		}
	})

	t.Run("Lookup falls back to email if UID search fails", func(t *testing.T) {
		repo := &stubUserRepo{
			errByUID: errors.New("not found"),
			userByEmail: &user.User{
				ID:          "user-1",
				Email:       "fallback@example.com",
				Role:        user.RoleGuest,
				Status:      user.StatusActive,
			},
		}
		mw := NewAuthMiddleware(repo)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{
			UID:   "uid-new",
			Email: "fallback@example.com",
		}))
		rr := httptest.NewRecorder()

		var invoked bool
		mw.RequireProfile(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
		if repo.updatedUser == nil || repo.updatedUser.FirebaseUID != "uid-new" {
			t.Error("expected user record to be updated with new FirebaseUID")
		}
	})
}

func TestRequireEmailVerified(t *testing.T) {
	t.Run("Allows verified email claims", func(t *testing.T) {
		mw := NewAuthMiddleware(&stubUserRepo{})

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{
			UID:           "uid-1",
			EmailVerified: true,
		}))
		rr := httptest.NewRecorder()

		var invoked bool
		mw.RequireEmailVerified(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
		if rr.Code != http.StatusOK {
			t.Errorf("expected 200, got %d", rr.Code)
		}
	})

	t.Run("Rejects unverified email claims with EMAIL_NOT_VERIFIED", func(t *testing.T) {
		mw := NewAuthMiddleware(&stubUserRepo{})

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithClaims(req.Context(), &actor.FirebaseClaims{
			UID:           "uid-1",
			EmailVerified: false,
		}))
		rr := httptest.NewRecorder()

		mw.RequireEmailVerified(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", rr.Code)
		}
	})
}

func TestRequireRoles(t *testing.T) {
	t.Run("Allows user with exact role", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role: user.RoleExportManager,
		}))
		rr := httptest.NewRecorder()

		var invoked bool
		RequireRoles(user.RoleExportManager, user.RoleAdmin)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
	})

	t.Run("Rejects user with missing role", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role: user.RoleGuest,
		}))
		rr := httptest.NewRecorder()

		RequireRoles(user.RoleExportManager, user.RoleAdmin)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", rr.Code)
		}
	})
}

func TestRequireTenantAccess(t *testing.T) {
	t.Run("Allows access when company ID matches", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/export-cases/case-123", nil)
		req.SetPathValue("caseId", "case-123")
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role:      user.RoleExportManager,
			CompanyID: "company-a",
		}))
		rr := httptest.NewRecorder()

		validator := func(r *http.Request, id string) (TenantResource, error) {
			if id != "case-123" {
				t.Fatalf("unexpected resource ID: %s", id)
			}
			return &mockResource{companyID: "company-a"}, nil
		}

		var invoked bool
		RequireTenantAccess("caseId", validator)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
	})

	t.Run("Allows admin access even if company ID mismatches", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/export-cases/case-123", nil)
		req.SetPathValue("caseId", "case-123")
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role:      user.RoleAdmin,
			CompanyID: "admin-company",
		}))
		rr := httptest.NewRecorder()

		validator := func(r *http.Request, id string) (TenantResource, error) {
			return &mockResource{companyID: "company-a"}, nil
		}

		var invoked bool
		RequireTenantAccess("caseId", validator)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			invoked = true
		})).ServeHTTP(rr, req)

		if !invoked {
			t.Error("expected handler to be invoked")
		}
	})

	t.Run("Rejects access when company ID mismatches", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/export-cases/case-123", nil)
		req.SetPathValue("caseId", "case-123")
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role:      user.RoleExportManager,
			CompanyID: "company-b",
		}))
		rr := httptest.NewRecorder()

		validator := func(r *http.Request, id string) (TenantResource, error) {
			return &mockResource{companyID: "company-a"}, nil
		}

		RequireTenantAccess("caseId", validator)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusForbidden {
			t.Errorf("expected 403, got %d", rr.Code)
		}
	})

	t.Run("Returns bad request when resource parameter is missing", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/export-cases/", nil)
		req = req.WithContext(actor.WithUser(req.Context(), &actor.User{
			Role:      user.RoleExportManager,
			CompanyID: "company-a",
		}))
		rr := httptest.NewRecorder()

		RequireTenantAccess("caseId", func(r *http.Request, id string) (TenantResource, error) {
			return nil, apperror.ErrNotFound
		})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Fatal("handler should not be invoked")
		})).ServeHTTP(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("expected 400, got %d", rr.Code)
		}
	})
}
