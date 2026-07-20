package company

import (
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Apply(w http.ResponseWriter, r *http.Request) {
	var req ApplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Apply(r.Context(), req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, data)
}

func (h *Handler) ApplicationStatus(w http.ResponseWriter, r *http.Request) {
	data, err := h.service.GetApplicationStatus(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	companyID := r.PathValue("companyId")
	data, err := h.service.GetCompanyDetail(r.Context(), companyID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

// ChangeRequest handles POST /companies/{companyId}/change-request.
// Company owners may request a profile change; an admin must approve.
func (h *Handler) ChangeRequest(w http.ResponseWriter, r *http.Request) {
	companyID := r.PathValue("companyId")
	if companyID == "" {
		response.Error(w, apperror.ErrValidation)
		return
	}

	u, ok := actor.FromContext(r.Context())
	if !ok {
		response.Error(w, apperror.ErrUnauthenticated)
		return
	}

	// Ensure only the company owner (or admin) may request a change
	if u.Role != "company_owner" && u.Role != "admin" {
		response.Error(w, apperror.ErrForbidden)
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"status":  "pending_review",
		"message": "Change request submitted. An Admin will review and apply your updates.",
	})
}
