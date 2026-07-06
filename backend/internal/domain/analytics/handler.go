package analytics

import (
	"net/http"

	"github.com/exora/backend/pkg/response"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Dashboard is the HTTP controller action that retrieves analytics metrics.
// It responds with a JSON representation of DashboardMetrics.
func (h *Handler) Dashboard(w http.ResponseWriter, r *http.Request) {
	metrics, err := h.service.GetDashboard(r.Context())
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusOK, metrics)
}
