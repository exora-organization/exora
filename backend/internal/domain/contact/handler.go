package contact

import (
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Submit(w http.ResponseWriter, r *http.Request) {
	var req SubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}

	if err := h.service.SubmitMessage(r.Context(), req); err != nil {
		response.Error(w, err)
		return
	}

	response.JSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "message submitted successfully",
	})
}
