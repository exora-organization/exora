package advisor

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
	cases   *exportcase.Service
}

func NewHandler(service *Service, cases *exportcase.Service) *Handler {
	return &Handler{service: service, cases: cases}
}

// CreateRecommendation handles POST /v1/export-cases/{caseId}/advisor/recommendations (SRS FR-018).
func (h *Handler) CreateRecommendation(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	ec, err := h.cases.GetByID(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}

	var req GenerateRequest
	// Optional body — ignore decode error if body is empty
	_ = json.NewDecoder(r.Body).Decode(&req)

	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}
	companyID := ec.CompanyID
	if u.Role == "admin" && companyID == "" {
		companyID = u.CompanyID
	}

	// Enforce FR-009a: Admin generates recommendations purely for platform oversight / troubleshooting.
	if u.Role == "admin" {
		rec := &AdvisorRecommendation{
			CaseID:         caseID,
			CompanyID:      companyID,
			Answer:         "AI Advisor (Oversight & Troubleshooting Mode): System diagnostics active. Business recommendations are only generated for company operational roles (Export Manager, Company Owner, Finance Staff).",
			Confidence:     "oversight",
			GeneratedAt:    time.Now(),
		}
		response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "recommendation": rec})
		return
	}

	rec, err := h.service.Generate(r.Context(), caseID, companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "recommendation": rec})
}

// GetRecommendation handles GET /v1/export-cases/{caseId}/advisor/recommendations (SRS FR-018).
func (h *Handler) GetRecommendation(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if _, err := h.cases.GetByID(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}

	u, ok := actor.FromContext(r.Context())
	if ok && u.Role == "admin" {
		// Admin viewing case-level recommendation gets the oversight notification if not already generated,
		// or they can inspect the saved database record.
		rec, err := h.service.GetRecommendation(r.Context(), caseID)
		if err != nil || rec == nil {
			rec = &AdvisorRecommendation{
				CaseID:         caseID,
				CompanyID:      "",
				Answer:         "AI Advisor (Oversight & Troubleshooting Mode): System diagnostics active. Business recommendations are only generated for company operational roles (Export Manager, Company Owner, Finance Staff).",
				Confidence:     "oversight",
				GeneratedAt:    time.Now(),
			}
		}
		response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "recommendation": rec})
		return
	}

	rec, err := h.service.GetRecommendation(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "recommendation": rec})
}

// CreateGlobalRecommendation handles POST /v1/advisor/recommendations.
func (h *Handler) CreateGlobalRecommendation(w http.ResponseWriter, r *http.Request) {
	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}
	companyID := u.CompanyID
	if companyID == "" && u.Role != "admin" {
		response.Error(w, apperror.ErrForbidden)
		return
	}

	// Enforce FR-009a: Admin generates recommendations purely for platform oversight / troubleshooting.
	if u.Role == "admin" {
		rec := &AdvisorRecommendation{
			CaseID:         "global",
			CompanyID:      companyID,
			Answer:         "AI Advisor (Oversight & Troubleshooting Mode): System diagnostics active. Business recommendations are only generated for company operational roles (Export Manager, Company Owner, Finance Staff).",
			Confidence:     "oversight",
			GeneratedAt:    time.Now(),
		}
		response.JSON(w, http.StatusOK, map[string]any{"caseId": "global", "recommendation": rec})
		return
	}

	var req GenerateRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	rec, err := h.service.GenerateGlobal(r.Context(), companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": "global", "recommendation": rec})
}

// GetGlobalRecommendation handles GET /v1/advisor/recommendations.
func (h *Handler) GetGlobalRecommendation(w http.ResponseWriter, r *http.Request) {
	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}
	companyID := u.CompanyID
	if companyID == "" && u.Role != "admin" {
		response.Error(w, apperror.ErrForbidden)
		return
	}

	if u.Role == "admin" {
		// Admin viewing global recommendations
		rec, err := h.service.GetGlobal(r.Context(), companyID)
		if err != nil || rec == nil {
			rec = &AdvisorRecommendation{
				CaseID:         "global",
				CompanyID:      companyID,
				Answer:         "AI Advisor (Oversight & Troubleshooting Mode): System diagnostics active. Business recommendations are only generated for company operational roles (Export Manager, Company Owner, Finance Staff).",
				Confidence:     "oversight",
				GeneratedAt:    time.Now(),
			}
		}
		response.JSON(w, http.StatusOK, map[string]any{"caseId": "global", "recommendation": rec})
		return
	}

	rec, err := h.service.GetGlobal(r.Context(), companyID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": "global", "recommendation": rec})
}

// GetSystemHealth handles GET /v1/admin/advisor/health.
func (h *Handler) GetSystemHealth(w http.ResponseWriter, r *http.Request) {
	stats, err := h.service.GetSystemHealth(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, stats)
}

