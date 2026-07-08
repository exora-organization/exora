package analytics

import (
	"context"
	"log/slog"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/risk"
	"github.com/exora/backend/internal/domain/user"
)

type Service struct {
	exportCases exportcase.Repository
	users       user.Repository
	risks       risk.Repository
}

func NewService(exportCases exportcase.Repository, users user.Repository, risks risk.Repository) *Service {
	return &Service{
		exportCases: exportCases,
		users:       users,
		risks:       risks,
	}
}

type RiskSummary struct {
	Low    int `json:"low"`
	Medium int `json:"medium"`
	High   int `json:"high"`
}

type TeamMember struct {
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	Status      string `json:"status"`
}

type TeamSummary struct {
	TotalMembers int            `json:"totalMembers"`
	Members      []TeamMember   `json:"members"`
	RoleCounts   map[string]int `json:"roleCounts"`
}

type DashboardMetrics struct {
	CompanyID               *string        `json:"companyId"`
	TotalExportCases        int            `json:"totalExportCases"`
	ActiveCases             int            `json:"activeCases"`
	AverageFeasibilityScore *float64       `json:"averageFeasibilityScore"`
	CasesByStatus           map[string]int `json:"casesByStatus"`
	RecentCases             []any          `json:"recentCases"`
	RiskSummary             *RiskSummary   `json:"riskSummary"`
	TeamSummary             *TeamSummary   `json:"teamSummary"`
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

	// Compute average feasibility score based on actual cases
	cases, _, err := s.exportCases.ListByCompany(ctx, companyID, 1000, "")
	if err == nil {
		sum := 0.0
		count := 0
		for _, c := range cases {
			if c.FeasibilityScore != nil {
				sum += *c.FeasibilityScore
				count++
			}
		}
		if count > 0 {
			avg = sum / float64(count)
		}
	}

	// Compute risk summary
	var riskSum RiskSummary
	if companyID != "" {
		riskAssessments, err := s.risks.ListByCompany(ctx, companyID)
		slog.Info("analytics: risk assessments query", "companyID", companyID, "count", len(riskAssessments), "err", err)
		if err == nil {
			for _, r := range riskAssessments {
				switch r.CountryRiskLevel {
				case risk.CountryRiskLow:
					riskSum.Low++
				case risk.CountryRiskMedium:
					riskSum.Medium++
				case risk.CountryRiskHigh:
					riskSum.High++
				}
			}
		}
	}

	// Compute team summary
	var teamSum TeamSummary
	teamSum.RoleCounts = make(map[string]int)
	if companyID != "" {
		members, err := s.users.ListByCompany(ctx, companyID)
		if err == nil {
			teamSum.TotalMembers = len(members)
			for _, m := range members {
				teamSum.Members = append(teamSum.Members, TeamMember{
					DisplayName: m.DisplayName,
					Email:       m.Email,
					Role:        m.Role,
					Status:      m.Status,
				})
				teamSum.RoleCounts[m.Role]++
			}
		}
	}

	slog.Info("analytics: dashboard metrics output", "riskSum", riskSum, "activeCases", active, "avgFeasibility", avg)

	return &DashboardMetrics{
		CompanyID:               companyPtr,
		TotalExportCases:        total,
		ActiveCases:             active,
		AverageFeasibilityScore: &avg,
		CasesByStatus: map[string]int{
			"draft":     draft,
			"in_review": inReview,
			"finalized": finalized,
		},
		RecentCases: []any{},
		RiskSummary: &riskSum,
		TeamSummary: &teamSum,
	}, nil
}
