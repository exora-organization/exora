package admin

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListApplications(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	cursor := r.URL.Query().Get("cursor")

	items, next, err := h.service.ListApplications(r.Context(), status, limit, cursor)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, response.Paginated{Items: items, NextCursor: next})
}

func (h *Handler) Approve(w http.ResponseWriter, r *http.Request) {
	companyID := r.PathValue("companyId")
	data, err := h.service.Approve(r.Context(), companyID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Reject(w http.ResponseWriter, r *http.Request) {
	companyID := r.PathValue("companyId")
	var req company.RejectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Reject(r.Context(), companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) RequestRevision(w http.ResponseWriter, r *http.Request) {
	companyID := r.PathValue("companyId")
	var req company.RevisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.RequestRevision(r.Context(), companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Monitoring(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.Monitoring(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}
