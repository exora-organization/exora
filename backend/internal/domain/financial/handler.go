package financial

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

// GetAnalysis handles GET /v1/export-cases/{caseId}/financial-analysis?incoterm=CIF (SRS FR-013).
func (h *Handler) GetAnalysis(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if _, err := h.cases.GetByID(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}
	// If no stored analysis, try to auto-calculate with incoterm query param
	incoterm := r.URL.Query().Get("incoterm")
	analysis, err := h.service.GetAnalysis(r.Context(), caseID)
	if err != nil && incoterm != "" {
		// Auto-recalculate if stored result missing but incoterm provided
		u, ok := actor.FromContext(r.Context())
		if !ok {
			response.Error(w, apperror.ErrUnauthenticated)
			return
		}
		ec, _ := h.cases.GetByID(r.Context(), caseID)
		companyID := ec.CompanyID
		if u.Role == "admin" {
			companyID = u.CompanyID
		}
		analysis, err = h.service.Recalculate(r.Context(), caseID, companyID, RecalculateRequest{Incoterm: incoterm})
		if err != nil {
			response.Error(w, err)
			return
		}
	} else if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "analysis": analysis})
}

// Recalculate handles POST /v1/export-cases/{caseId}/financial-analysis/recalculate (SRS FR-024).
func (h *Handler) Recalculate(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	ec, err := h.cases.GetByID(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}

	var req RecalculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}

	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}
	companyID := ec.CompanyID
	if u.Role == "admin" && companyID == "" {
		companyID = u.CompanyID
	}

	analysis, err := h.service.Recalculate(r.Context(), caseID, companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "analysis": analysis})
}
