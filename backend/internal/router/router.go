package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/admin"
	"github.com/exora/backend/internal/domain/advisor"
	"github.com/exora/backend/internal/domain/analytics"
	"github.com/exora/backend/internal/domain/auth"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/document"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/financial"
	"github.com/exora/backend/internal/domain/invitation"
	"github.com/exora/backend/internal/domain/pricing"
	"github.com/exora/backend/internal/domain/risk"
	"github.com/exora/backend/internal/domain/scenario"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/internal/middleware"
)

type Handlers struct {
	Auth       *auth.Handler
	Company    *company.Handler
	Admin      *admin.Handler
	User       *user.Handler
	Invitation *invitation.Handler
	ExportCase *exportcase.Handler
	Costing    *costing.Handler
	Pricing    *pricing.Handler
	Financial  *financial.Handler
	Scenario   *scenario.Handler
	Risk       *risk.Handler
	Advisor    *advisor.Handler
	Document   *document.Handler
	Analytics  *analytics.Handler
}

type Dependencies struct {
	Config         *config.Config
	Firebase       *middleware.FirebaseMiddleware
	Auth           *middleware.AuthMiddleware
	AuditLogger    middleware.AuditLogger
	ExportCaseRepo exportcase.Repository
}

func New(deps Dependencies, h Handlers) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Recover)
	r.Use(middleware.Logger)
	r.Use(middleware.CORS(deps.Config.CORSAllowedOrigins))
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Route("/v1", func(r chi.Router) {
		// Public invitation preview
		r.Get("/invitations/{token}", h.Invitation.Preview)

		// Auth: Firebase token required; register only needs token, login/me need profile
		r.Group(func(r chi.Router) {
			r.Use(deps.Firebase.VerifyToken)

			r.Post("/auth/register", h.Auth.Register)

			r.Group(func(r chi.Router) {
				r.Use(deps.Auth.RequireProfile)

				r.Post("/auth/login", h.Auth.Login)
				r.Post("/auth/logout", h.Auth.Logout)
				r.Get("/users/me", h.User.Me)

				// Company application
				r.With(middleware.RequireRoles("guest")).Post("/companies/apply", h.Company.Apply)
				r.With(middleware.RequireRoles("guest", "company_owner")).Get("/companies/application-status", h.Company.ApplicationStatus)
				r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/companies/{companyId}", h.Company.Get)

				// User management
				r.With(middleware.RequireRoles("company_owner")).Post("/users/invite", h.User.Invite)
				r.With(middleware.RequireRoles("company_owner", "admin")).Get("/users", h.User.List)
				r.With(middleware.RequireRoles("company_owner", "admin")).Get("/users/{userId}", h.User.Get)
				r.With(middleware.RequireRoles("company_owner", "admin")).Patch("/users/{userId}", h.User.Update)
				r.With(middleware.RequireRoles("company_owner", "admin")).Delete("/users/{userId}", h.User.Delete)
				r.With(middleware.RequireRoles("company_owner", "admin")).Patch("/users/{userId}/role", h.User.ChangeRole)

				// Invitations
				r.With(middleware.RequireRoles("company_owner")).Get("/invitations", h.Invitation.List)
				r.With(middleware.RequireRoles("company_owner")).Post("/invitations/resend", h.Invitation.Resend)
				r.Post("/invitations/{token}/accept", h.Invitation.Accept)

				// Admin
				r.With(
					middleware.RequireRoles("admin"),
					middleware.Audit("admin_action", deps.AuditLogger),
				).Route("/admin", func(r chi.Router) {
					r.Get("/company-applications", h.Admin.ListApplications)
					r.Post("/company-applications/{companyId}/approve", h.Admin.Approve)
					r.Post("/company-applications/{companyId}/reject", h.Admin.Reject)
					r.Post("/company-applications/{companyId}/request-revision", h.Admin.RequestRevision)
					r.Get("/monitoring", h.Admin.Monitoring)
					r.Get("/audit-logs", h.Admin.ListAuditLogs)
				})

				// Export cases
				r.Route("/export-cases", func(r chi.Router) {
					r.With(middleware.RequireRoles("export_manager", "admin")).Post("/", h.ExportCase.Create)
					r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/", h.ExportCase.List)

					r.Route("/{caseId}", func(r chi.Router) {
						r.Use(middleware.RequireTenantAccess("caseId", func(r *http.Request, resourceID string) (middleware.TenantResource, error) {
							if deps.ExportCaseRepo == nil {
								return nil, apperror.ErrNotFound
							}
							caseResource, err := deps.ExportCaseRepo.GetByID(r.Context(), resourceID)
							if err != nil {
								return nil, err
							}
							return caseResource, nil
						}))
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/", h.ExportCase.Get)
						r.With(middleware.RequireRoles("export_manager", "admin")).Put("/", h.ExportCase.Update)
						r.With(middleware.RequireRoles("export_manager", "admin")).Delete("/", h.ExportCase.Delete)

						r.With(middleware.RequireRoles("export_manager", "finance_staff", "admin")).Put("/cost-data", h.Costing.PutCostData)
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/cost-data", h.Costing.GetCostData)

						r.With(middleware.RequireRoles("export_manager", "admin")).Post("/pricing/calculate", h.Pricing.Calculate)
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/pricing", h.Pricing.Get)

						r.With(middleware.RequireRoles("finance_staff", "company_owner", "admin")).Get("/financial-analysis", h.Financial.GetAnalysis)
						r.With(middleware.RequireRoles("finance_staff", "export_manager", "admin")).Post("/financial-analysis/recalculate", h.Financial.Recalculate)

						r.With(middleware.RequireRoles("export_manager", "admin")).Post("/scenarios", h.Scenario.Create)
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/scenarios/compare", h.Scenario.Compare)

						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/risk-assessment", h.Risk.GetAssessment)

						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Post("/advisor/recommendations", h.Advisor.CreateRecommendation)
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/advisor/recommendations", h.Advisor.GetRecommendation)

						r.With(middleware.RequireRoles("export_manager", "company_owner", "admin")).Post("/documents/quotation", h.Document.GenerateQuotation)
						r.With(middleware.RequireRoles("export_manager", "company_owner", "admin")).Post("/documents/proforma-invoice", h.Document.GenerateProforma)
						r.With(middleware.RequireRoles("export_manager", "company_owner", "admin")).Post("/documents/cost-breakdown-report", h.Document.GenerateCostBreakdown)
						r.With(middleware.RequireRoles("export_manager", "company_owner", "admin")).Post("/documents/feasibility-report", h.Document.GenerateFeasibility)
						r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/documents", h.Document.ListByCase)
					})
				})

				r.With(middleware.RequireRoles("export_manager", "company_owner", "admin")).Get("/documents/{documentId}/download", h.Document.Download)

				r.Route("/advisor", func(r chi.Router) {
					r.With(middleware.RequireRoles("company_owner", "export_manager", "admin")).Post("/recommendations", h.Advisor.CreateGlobalRecommendation)
					r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/recommendations", h.Advisor.GetGlobalRecommendation)
				})

				r.With(middleware.RequireRoles("company_owner", "export_manager", "finance_staff", "admin")).Get("/analytics", h.Analytics.Dashboard)
			})
		})
	})

	return r
}
