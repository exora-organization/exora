package admin

import (
	"context"
	"strings"
	"time"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	repo      Repository
	companies company.Repository
	users     user.Repository
}

func NewService(repo Repository, companies company.Repository, users user.Repository) *Service {
	return &Service{repo: repo, companies: companies, users: users}
}

func (s *Service) ListApplications(ctx context.Context, status string, limit int, cursor string) ([]company.ApplicationListItem, *string, error) {
	companies, next, err := s.companies.List(ctx, status, limit, cursor)
	if err != nil {
		return nil, nil, err
	}
	items := make([]company.ApplicationListItem, 0, len(companies))
	for _, c := range companies {
		applicant, _ := s.users.GetByID(ctx, c.ApplicantUserID)
		item := company.ApplicationListItem{
			CompanyID:      c.ID,
			CompanyName:    c.CompanyName,
			BusinessSector: c.BusinessSector,
			Country:        c.Country,
			Status:         c.Status,
			SubmittedAt:    c.SubmittedAt.UTC().Format(time.RFC3339),
		}
		if applicant != nil {
			item.Applicant = company.Applicant{
				UserID:      applicant.ID,
				Email:       applicant.Email,
				DisplayName: applicant.DisplayName,
			}
		}
		items = append(items, item)
	}
	return items, next, nil
}

func (s *Service) Approve(ctx context.Context, companyID string) (*company.ApproveResponse, error) {
	c, err := s.companies.GetByID(ctx, companyID)
	if err != nil {
		return nil, err
	}
	if c.Status == company.StatusApproved {
		return nil, apperror.New("UNPROCESSABLE", "company already approved", 422)
	}

	now := time.Now().UTC()
	c.Status = company.StatusApproved
	c.ApprovedAt = &now
	if err := s.companies.Update(ctx, c); err != nil {
		return nil, err
	}

	u, err := s.users.GetByID(ctx, c.ApplicantUserID)
	if err != nil {
		return nil, err
	}
	u.Role = user.RoleCompanyOwner
	u.CompanyID = c.ID
	if err := s.users.Update(ctx, u); err != nil {
		return nil, err
	}

	return &company.ApproveResponse{
		CompanyID:   c.ID,
		Status:      c.Status,
		ApprovedAt:  now.Format(time.RFC3339),
		OwnerUserID: u.ID,
		OwnerRole:   user.RoleCompanyOwner,
	}, nil
}

func (s *Service) Reject(ctx context.Context, companyID string, req company.RejectRequest) (map[string]string, error) {
	// BUG-030: Trim whitespace before validation to reject whitespace-only input
	req.Reason = strings.TrimSpace(req.Reason)
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	c, err := s.companies.GetByID(ctx, companyID)
	if err != nil {
		return nil, err
	}
	c.Status = company.StatusRejected
	c.RejectReason = req.Reason
	if err := s.companies.Update(ctx, c); err != nil {
		return nil, err
	}
	return map[string]string{"companyId": c.ID, "status": c.Status}, nil
}

func (s *Service) RequestRevision(ctx context.Context, companyID string, req company.RevisionRequest) (map[string]string, error) {
	// BUG-030: Trim whitespace before validation to reject whitespace-only input
	req.RevisionNotes = strings.TrimSpace(req.RevisionNotes)
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	c, err := s.companies.GetByID(ctx, companyID)
	if err != nil {
		return nil, err
	}
	c.Status = company.StatusRevisionRequested
	c.RevisionNotes = req.RevisionNotes
	if err := s.companies.Update(ctx, c); err != nil {
		return nil, err
	}
	return map[string]string{
		"companyId":     c.ID,
		"status":        c.Status,
		"revisionNotes": c.RevisionNotes,
	}, nil
}

func (s *Service) Monitoring(ctx context.Context) (*MonitoringStats, error) {
	totalCompanies, _ := s.companies.CountAll(ctx)
	totalUsers, _ := s.users.Count(ctx)
	totalCases, _ := s.repo.CountExportCases(ctx)
	pending, _ := s.companies.CountByStatus(ctx, company.StatusPending)
	aiUsage, _ := s.repo.CountAIRecommendations(ctx)

	since := time.Now().UTC().Add(-7 * 24 * time.Hour)
	logins, _ := s.repo.CountAuditLogsByAction(ctx, "user_login", since)
	cases, _ := s.repo.CountExportCasesSince(ctx, since)

	return &MonitoringStats{
		TotalCompanies:        totalCompanies,
		TotalUsers:            totalUsers,
		TotalExportCases:      totalCases,
		PendingApprovals:      pending,
		ActiveUsersLast30Days: totalUsers,
		AIUsageCount:          aiUsage,
		UserActivityStats: UserActivityStats{
			LoginsLast7Days:       logins,
			CasesCreatedLast7Days: cases,
		},
	}, nil
}

func (s *Service) ListAuditLogs(ctx context.Context, limit int) ([]AuditLog, error) {
	return s.repo.ListAuditLogs(ctx, limit)
}

