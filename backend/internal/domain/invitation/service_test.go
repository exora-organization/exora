package invitation

import (
	"context"
	"testing"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
)

type stubInvitationRepo struct {
	inv *Invitation
}

func (s *stubInvitationRepo) Create(context.Context, *Invitation) error            { return nil }
func (s *stubInvitationRepo) GetByID(context.Context, string) (*Invitation, error) { return s.inv, nil }
func (s *stubInvitationRepo) GetByToken(context.Context, string) (*Invitation, error) {
	return s.inv, nil
}
func (s *stubInvitationRepo) GetPendingByEmailAndCompany(context.Context, string, string) (*Invitation, error) {
	return nil, apperror.ErrNotFound
}
func (s *stubInvitationRepo) GetPendingByEmail(context.Context, string) (*Invitation, error) {
	return nil, apperror.ErrNotFound
}
func (s *stubInvitationRepo) ListPendingByCompany(context.Context, string) ([]*Invitation, error) {
	return nil, nil
}
func (s *stubInvitationRepo) Update(context.Context, *Invitation) error { return nil }
func (s *stubInvitationRepo) Delete(context.Context, string) error { return nil }

type stubUserRepo struct {
	user *user.User
}

func (s *stubUserRepo) GetByID(context.Context, string) (*user.User, error) { return s.user, nil }
func (s *stubUserRepo) GetByFirebaseUID(context.Context, string) (*user.User, error) {
	return s.user, nil
}
func (s *stubUserRepo) GetByEmail(context.Context, string) (*user.User, error)      { return s.user, nil }
func (s *stubUserRepo) ListByCompany(context.Context, string) ([]*user.User, error) { return nil, nil }
func (s *stubUserRepo) ListAll(context.Context, string) ([]*user.User, error)       { return nil, nil }
func (s *stubUserRepo) Create(context.Context, *user.User) error                    { return nil }
func (s *stubUserRepo) Update(context.Context, *user.User) error                    { return nil }
func (s *stubUserRepo) Delete(context.Context, string) error                        { return nil }
func (s *stubUserRepo) Count(context.Context) (int, error)                          { return 0, nil }

type stubCompanyRepo struct{}

func (s *stubCompanyRepo) Create(context.Context, *company.Company) error { return nil }
func (s *stubCompanyRepo) GetByID(context.Context, string) (*company.Company, error) {
	return &company.Company{ID: "c1", CompanyName: "Acme"}, nil
}
func (s *stubCompanyRepo) GetByApplicantUserID(context.Context, string) (*company.Company, error) {
	return nil, nil
}
func (s *stubCompanyRepo) Update(context.Context, *company.Company) error { return nil }
func (s *stubCompanyRepo) List(context.Context, string, int, string) ([]*company.Company, *string, error) {
	return nil, nil, nil
}
func (s *stubCompanyRepo) CountByStatus(context.Context, string) (int, error) { return 0, nil }
func (s *stubCompanyRepo) CountAll(context.Context) (int, error)              { return 0, nil }

func TestLoadValidInvitationRejectsExpiredToken(t *testing.T) {
	repo := &stubInvitationRepo{inv: &Invitation{ID: "i1", CompanyID: "c1", Email: "guest@example.com", Role: user.RoleExportManager, Token: "abc", Status: StatusPending, ExpiresAt: time.Now().Add(-time.Hour)}}
	svc := NewService(repo, &stubUserRepo{}, &stubCompanyRepo{}, time.Hour, "https://app.example")
	ctx := actor.WithClaims(context.Background(), &actor.FirebaseClaims{UID: "uid", Email: "guest@example.com"})
	_, err := svc.loadValidInvitation(ctx, "abc")
	if err == nil {
		t.Fatal("expected expired invitation error")
	}
}
