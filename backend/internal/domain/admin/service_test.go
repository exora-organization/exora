package admin_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/exora/backend/internal/domain/admin"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
)

type stubAdminRepo struct{}

func (s *stubAdminRepo) LogAudit(ctx context.Context, entry admin.AuditLog) error { return nil }
func (s *stubAdminRepo) CountUsers(ctx context.Context) (int, error)            { return 0, nil }
func (s *stubAdminRepo) CountPendingApplications(ctx context.Context) (int, error) {
	return 0, nil
}
func (s *stubAdminRepo) CountExportCases(ctx context.Context) (int, error)      { return 0, nil }
func (s *stubAdminRepo) CountAIRecommendations(ctx context.Context) (int, error) { return 0, nil }
func (s *stubAdminRepo) ListAuditLogs(ctx context.Context, limit int) ([]admin.AuditLog, error) {
	return nil, nil
}
func (s *stubAdminRepo) CountAuditLogsByAction(ctx context.Context, action string, since time.Time) (int, error) {
	return 0, nil
}
func (s *stubAdminRepo) CountExportCasesSince(ctx context.Context, since time.Time) (int, error) {
	return 0, nil
}

type stubCompanyRepo struct {
	comp *company.Company
	err  error
}

func (s *stubCompanyRepo) Create(ctx context.Context, c *company.Company) error { return nil }
func (s *stubCompanyRepo) GetByID(ctx context.Context, id string) (*company.Company, error) {
	if s.err != nil {
		return nil, s.err
	}
	if s.comp != nil && s.comp.ID == id {
		return s.comp, nil
	}
	return nil, errors.New("not found")
}
func (s *stubCompanyRepo) GetByApplicantUserID(ctx context.Context, userID string) (*company.Company, error) {
	return nil, nil
}
func (s *stubCompanyRepo) Update(ctx context.Context, c *company.Company) error {
	s.comp = c
	return nil
}
func (s *stubCompanyRepo) List(ctx context.Context, status string, limit int, cursor string) ([]*company.Company, *string, error) {
	return nil, nil, nil
}
func (s *stubCompanyRepo) CountByStatus(ctx context.Context, status string) (int, error) {
	return 0, nil
}
func (s *stubCompanyRepo) CountAll(ctx context.Context) (int, error) { return 0, nil }

type stubUserRepo struct {
	usr *user.User
	err error
}

func (s *stubUserRepo) GetByID(ctx context.Context, id string) (*user.User, error) {
	if s.err != nil {
		return nil, s.err
	}
	if s.usr != nil && s.usr.ID == id {
		return s.usr, nil
	}
	return nil, errors.New("not found")
}
func (s *stubUserRepo) GetByFirebaseUID(ctx context.Context, firebaseUID string) (*user.User, error) {
	return nil, nil
}
func (s *stubUserRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	return nil, nil
}
func (s *stubUserRepo) ListByCompany(ctx context.Context, companyID string) ([]*user.User, error) {
	return nil, nil
}
func (s *stubUserRepo) ListAll(ctx context.Context, companyIDFilter string) ([]*user.User, error) {
	return nil, nil
}
func (s *stubUserRepo) Create(ctx context.Context, u *user.User) error { return nil }
func (s *stubUserRepo) Update(ctx context.Context, u *user.User) error {
	s.usr = u
	return nil
}
func (s *stubUserRepo) Delete(ctx context.Context, id string) error { return nil }
func (s *stubUserRepo) Count(ctx context.Context) (int, error)       { return 0, nil }

func TestApprove(t *testing.T) {
	cRepo := &stubCompanyRepo{
		comp: &company.Company{
			ID:              "company-1",
			ApplicantUserID: "user-1",
			Status:          company.StatusPending,
		},
	}
	uRepo := &stubUserRepo{
		usr: &user.User{
			ID:   "user-1",
			Role: user.RoleGuest,
		},
	}
	service := admin.NewService(&stubAdminRepo{}, cRepo, uRepo)

	resp, err := service.Approve(context.Background(), "company-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Status != company.StatusApproved {
		t.Errorf("expected status %s, got %s", company.StatusApproved, resp.Status)
	}
	if cRepo.comp.Status != company.StatusApproved {
		t.Errorf("expected repo company status %s, got %s", company.StatusApproved, cRepo.comp.Status)
	}
	if uRepo.usr.Role != user.RoleCompanyOwner {
		t.Errorf("expected user role %s, got %s", user.RoleCompanyOwner, uRepo.usr.Role)
	}
	if uRepo.usr.CompanyID != "company-1" {
		t.Errorf("expected user companyId %s, got %s", "company-1", uRepo.usr.CompanyID)
	}
}

func TestReject(t *testing.T) {
	cRepo := &stubCompanyRepo{
		comp: &company.Company{
			ID:              "company-1",
			ApplicantUserID: "user-1",
			Status:          company.StatusPending,
		},
	}
	service := admin.NewService(&stubAdminRepo{}, cRepo, &stubUserRepo{})

	req := company.RejectRequest{Reason: "Invalid company documentation"}
	resp, err := service.Reject(context.Background(), "company-1", req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp["status"] != company.StatusRejected {
		t.Errorf("expected status %s, got %s", company.StatusRejected, resp["status"])
	}
	if cRepo.comp.Status != company.StatusRejected {
		t.Errorf("expected repo company status %s, got %s", company.StatusRejected, cRepo.comp.Status)
	}
	if cRepo.comp.RejectReason != "Invalid company documentation" {
		t.Errorf("expected reject reason to be set, got %s", cRepo.comp.RejectReason)
	}
}

func TestRequestRevision(t *testing.T) {
	cRepo := &stubCompanyRepo{
		comp: &company.Company{
			ID:              "company-1",
			ApplicantUserID: "user-1",
			Status:          company.StatusPending,
		},
	}
	service := admin.NewService(&stubAdminRepo{}, cRepo, &stubUserRepo{})

	req := company.RevisionRequest{RevisionNotes: "Please correct the country code"}
	resp, err := service.RequestRevision(context.Background(), "company-1", req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp["status"] != company.StatusRevisionRequested {
		t.Errorf("expected status %s, got %s", company.StatusRevisionRequested, resp["status"])
	}
	if cRepo.comp.Status != company.StatusRevisionRequested {
		t.Errorf("expected repo company status %s, got %s", company.StatusRevisionRequested, cRepo.comp.Status)
	}
	if cRepo.comp.RevisionNotes != "Please correct the country code" {
		t.Errorf("expected revision notes to be set, got %s", cRepo.comp.RevisionNotes)
	}
}
