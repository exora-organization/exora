package costing

import (
	"encoding/json"
	"net/http"
	"strings"

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

// PutCostData handles PUT /v1/export-cases/{caseId}/cost-data (SRS FR-010).
func (h *Handler) PutCostData(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	ec, err := h.cases.GetByID(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}

	var req SaveCostDataRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	// RULE-023: trim string fields
	req.PaymentTerm = strings.TrimSpace(req.PaymentTerm)

	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}

	companyID := ec.CompanyID
	if u.Role == "admin" && companyID == "" {
		companyID = u.CompanyID
	}

	result, err := h.service.SaveCostData(r.Context(), caseID, companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, result)
}

// GetCostData handles GET /v1/export-cases/{caseId}/cost-data.
func (h *Handler) GetCostData(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if _, err := h.cases.GetByID(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}
	result, err := h.service.GetCostData(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, result)
}
