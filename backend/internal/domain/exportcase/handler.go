package exportcase

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Create parses a CreateRequest JSON payload and calls the domain service to save a new case.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Create(r.Context(), req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, data)
}

// List retrieves paginated lists of export cases, optionally filtered by company ID.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	companyID := r.URL.Query().Get("companyId")
	items, next, err := h.service.List(r.Context(), companyID, limit, r.URL.Query().Get("cursor"))
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, response.Paginated{Items: items, NextCursor: next})
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	data, err := h.service.GetDetail(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	var req UpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Update(r.Context(), caseID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if err := h.service.Delete(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "deleted": true})
}
