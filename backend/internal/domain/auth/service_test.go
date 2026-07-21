package auth

import (
	"context"
	"net/http"
	"testing"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/invitation"
	"github.com/exora/backend/internal/domain/user"
)

type mockUserRepo struct {
	user.Repository
	GetByFirebaseUIDFn func(ctx context.Context, uid string) (*user.User, error)
	CreateFn           func(ctx context.Context, u *user.User) error
}

func (m *mockUserRepo) GetByFirebaseUID(ctx context.Context, uid string) (*user.User, error) {
	return m.GetByFirebaseUIDFn(ctx, uid)
}

func (m *mockUserRepo) Create(ctx context.Context, u *user.User) error {
	return m.CreateFn(ctx, u)
}

type mockCompanyRepo struct {
	company.Repository
}

type mockInvitationRepo struct {
	invitation.Repository
	GetPendingByEmailFn func(ctx context.Context, email string) (*invitation.Invitation, error)
}

func (m *mockInvitationRepo) GetPendingByEmail(ctx context.Context, email string) (*invitation.Invitation, error) {
	if m.GetPendingByEmailFn != nil {
		return m.GetPendingByEmailFn(ctx, email)
	}
	return nil, apperror.ErrNotFound
}

func (m *mockCompanyRepo) GetByApplicantUserID(ctx context.Context, userID string) (*company.Company, error) {
	return nil, nil
}



func TestRegisterWithRecaptcha(t *testing.T) {
	// Test case 1: reCAPTCHA is disabled (secret key is empty)
	t.Run("reCAPTCHA Disabled", func(t *testing.T) {
		userRepo := &mockUserRepo{
			GetByFirebaseUIDFn: func(ctx context.Context, uid string) (*user.User, error) {
				return nil, http.ErrNoLocation
			},
			CreateFn: func(ctx context.Context, u *user.User) error {
				return nil
			},
		}
		companyRepo := &mockCompanyRepo{}
		invitationRepo := &mockInvitationRepo{}

		svc := NewService(userRepo, companyRepo, invitationRepo, "") // recaptchaSecret is empty

		ctx := actor.WithClaims(context.Background(), &actor.FirebaseClaims{
			UID:   "test-uid",
			Email: "test@exora.com",
		})

		req := user.RegisterRequest{
			DisplayName:    "Test User",
			RecaptchaToken: "", // empty, should bypass
		}

		profile, err := svc.Register(ctx, req)
		if err != nil {
			t.Fatalf("expected no error, got: %v", err)
		}
		if profile.DisplayName != "Test User" {
			t.Errorf("expected DisplayName 'Test User', got '%s'", profile.DisplayName)
		}
	})

	// Test case 2: reCAPTCHA is enabled but token is missing
	t.Run("reCAPTCHA Enabled Token Missing", func(t *testing.T) {
		userRepo := &mockUserRepo{}
		companyRepo := &mockCompanyRepo{}
		invitationRepo := &mockInvitationRepo{}

		svc := NewService(userRepo, companyRepo, invitationRepo, "secret-key") // recaptchaSecret is configured

		ctx := actor.WithClaims(context.Background(), &actor.FirebaseClaims{
			UID:   "test-uid",
			Email: "test@exora.com",
		})

		req := user.RegisterRequest{
			DisplayName:    "Test User",
			RecaptchaToken: "", // missing token
		}

		_, err := svc.Register(ctx, req)
		if err == nil {
			t.Fatal("expected error, got nil")
		}
		if err.Error() != "reCAPTCHA verification token is required" {
			t.Errorf("expected token missing error, got: %v", err)
		}
	})
}
