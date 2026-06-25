package scenario

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

// Create handles POST /v1/export-cases/{caseId}/scenarios (SRS FR-014).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	ec, err := h.cases.GetByID(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}

	var req CreateScenarioRequest
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

	sc, err := h.service.Create(r.Context(), caseID, companyID, req)
	if err != nil {
		response.Error(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{
		"caseId":   caseID,
		"scenario": toListItem(sc),
	})
}

// Compare handles GET /v1/export-cases/{caseId}/scenarios/compare?scenarioIds=id1,id2 (SRS FR-014).
func (h *Handler) Compare(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if _, err := h.cases.GetByID(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}

	raw := r.URL.Query().Get("scenarioIds")
	var ids []string
	if raw != "" {
		for _, id := range strings.Split(raw, ",") {
			if trimmed := strings.TrimSpace(id); trimmed != "" {
				ids = append(ids, trimmed)
			}
		}
	}

	// If no IDs provided, return all scenarios for the case
	if len(ids) == 0 {
		scenarios, err := h.service.List(r.Context(), caseID)
		if err != nil {
			response.Error(w, err)
			return
		}
		items := make([]ScenarioListItem, 0, len(scenarios))
		for _, sc := range scenarios {
			items = append(items, toListItem(sc))
		}
		response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "scenarios": items})
		return
	}

	scenarios, err := h.service.Compare(r.Context(), caseID, ids)
	if err != nil {
		response.Error(w, err)
		return
	}
	items := make([]ScenarioListItem, 0, len(scenarios))
	for _, sc := range scenarios {
		items = append(items, toListItem(sc))
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "comparison": items})
}

func toListItem(s *Scenario) ScenarioListItem {
	return ScenarioListItem{
		ScenarioID:      s.ID,
		CaseID:          s.CaseID,
		Name:            s.Name,
		Incoterm:        s.Incoterm,
		TotalCostIDR:    s.TotalCostIDR,
		SellingPriceIDR: s.SellingPriceIDR,
		SellingPriceUSD: s.SellingPriceUSD,
		ActualMarginPct: s.ActualMarginPct,
		CreatedAt:       s.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	}
}
