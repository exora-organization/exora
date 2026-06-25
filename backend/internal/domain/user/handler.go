package user

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
	inviter Inviter
}

type Inviter interface {
	Invite(ctx context.Context, req InviteRequest) (any, error)
}

func NewHandler(service *Service, inviter Inviter) *Handler {
	return &Handler{service: service, inviter: inviter}
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	profile, err := h.service.Me(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, profile)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	companyID := r.URL.Query().Get("companyId")
	items, err := h.service.List(r.Context(), companyID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.Update(r.Context(), userID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	data, err := h.service.Delete(r.Context(), userID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) ChangeRole(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	var req ChangeRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.service.ChangeRole(r.Context(), userID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	data, err := h.service.GetUserByID(r.Context(), userID)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, data)
}

func (h *Handler) Invite(w http.ResponseWriter, r *http.Request) {
	var req InviteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	data, err := h.inviter.Invite(r.Context(), req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, data)
}
