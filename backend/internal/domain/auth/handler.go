package auth

import (
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

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req user.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, apperror.ErrValidation)
		return
	}
	profile, err := h.service.Register(r.Context(), req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, profile)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	profile, err := h.service.Login(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, profile)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	data := h.service.Logout(r.Context())
	response.JSON(w, http.StatusOK, data)
}
