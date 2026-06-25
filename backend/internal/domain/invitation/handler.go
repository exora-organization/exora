package invitation

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.List(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) Preview(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	data, err := h.service.Preview(r.Context(), token)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Accept(w http.ResponseWriter, r *http.Request) {
	token := r.PathValue("token")
	data, err := h.service.Accept(r.Context(), token)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Resend(w http.ResponseWriter, r *http.Request) {
	var req ResendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Resend(r.Context(), req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

// Invite satisfies user.Inviter interface
func (h *Handler) Invite(ctx context.Context, req user.InviteRequest) (any, error) {
	return h.service.Invite(ctx, req)
}
