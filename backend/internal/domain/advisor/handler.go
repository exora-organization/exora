package advisor

import (
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
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
	if companyID == "" {
		response.Error(w, apperror.ErrForbidden)
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
	if companyID == "" {
		response.Error(w, apperror.ErrForbidden)
		return
	}

	rec, err := h.service.GetGlobal(r.Context(), companyID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": "global", "recommendation": rec})
}

