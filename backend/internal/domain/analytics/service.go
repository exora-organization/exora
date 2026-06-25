package analytics

import (
	"context"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/user"
)

type Service struct {
	exportCases exportcase.Repository
}

func NewService(exportCases exportcase.Repository) *Service {
	return &Service{exportCases: exportCases}
}

type DashboardMetrics struct {
	CompanyID               *string        `json:"companyId"`
	TotalExportCases        int            `json:"totalExportCases"`
	ActiveCases             int            `json:"activeCases"`
	AverageFeasibilityScore *float64       `json:"averageFeasibilityScore"`
	CasesByStatus           map[string]int `json:"casesByStatus"`
	RecentCases             []any          `json:"recentCases"`
}

func (s *Service) GetDashboard(ctx context.Context) (*DashboardMetrics, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	companyID := u.CompanyID
	if u.Role == user.RoleAdmin {
		companyID = ""
	}
	if companyID == "" && u.Role != user.RoleAdmin {
		return nil, apperror.ErrForbidden
	}

	var companyPtr *string
	if companyID != "" {
		companyPtr = &companyID
	}

	total, _ := s.exportCases.CountByCompany(ctx, companyID)
	inReview, _ := s.exportCases.CountByStatus(ctx, companyID, exportcase.StatusInReview)
	draft, _ := s.exportCases.CountByStatus(ctx, companyID, exportcase.StatusDraft)
	finalized, _ := s.exportCases.CountByStatus(ctx, companyID, exportcase.StatusFinalized)

	active := inReview + draft
	avg := 0.0

	return &DashboardMetrics{
		CompanyID:               companyPtr,
		TotalExportCases:        total,
		ActiveCases:             active,
		AverageFeasibilityScore: &avg,
		CasesByStatus: map[string]int{
			"draft":      draft,
			"in_review":  inReview,
			"finalized":  finalized,
		},
		RecentCases: []any{},
	}, nil
}
