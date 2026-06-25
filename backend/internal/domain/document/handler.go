package document

import (
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

func (h *Handler) GenerateQuotation(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, func(caseID, companyID string) (*GenerateResult, error) {
		return h.service.GenerateQuotation(r.Context(), caseID, companyID)
	})
}

func (h *Handler) GenerateProforma(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, func(caseID, companyID string) (*GenerateResult, error) {
		return h.service.GenerateProforma(r.Context(), caseID, companyID)
	})
}

func (h *Handler) GenerateCostBreakdown(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, func(caseID, companyID string) (*GenerateResult, error) {
		return h.service.GenerateCostBreakdown(r.Context(), caseID, companyID)
	})
}

func (h *Handler) GenerateFeasibility(w http.ResponseWriter, r *http.Request) {
	h.generate(w, r, func(caseID, companyID string) (*GenerateResult, error) {
		return h.service.GenerateFeasibility(r.Context(), caseID, companyID)
	})
}

func (h *Handler) generate(w http.ResponseWriter, r *http.Request, fn func(caseID, companyID string) (*GenerateResult, error)) {
	caseID := r.PathValue("caseId")
	ec, err := h.cases.GetByID(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
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

	result, err := fn(caseID, companyID)
	if err != nil {
		response.Error(w, err)
		return
	}

	doc := result.Document
	response.JSON(w, http.StatusCreated, map[string]any{
		"documentId":   doc.ID,
		"caseId":       doc.CaseID,
		"documentType": doc.DocumentType,
		"filename":     doc.Filename,
		"downloadUrl":  doc.DownloadURL,
		"generatedAt":  doc.GeneratedAt.UTC().Format("2006-01-02T15:04:05Z"),
	})
}

// ListByCase handles GET /v1/export-cases/{caseId}/documents.
func (h *Handler) ListByCase(w http.ResponseWriter, r *http.Request) {
	caseID := r.PathValue("caseId")
	if _, err := h.cases.GetByID(r.Context(), caseID); err != nil {
		response.Error(w, err)
		return
	}
	docs, err := h.service.ListByCase(r.Context(), caseID)
	if err != nil {
		response.Error(w, err)
		return
	}
	items := make([]DocumentListItem, 0, len(docs))
	for _, d := range docs {
		items = append(items, DocumentListItem{
			DocumentID:   d.ID,
			CaseID:       d.CaseID,
			DocumentType: d.DocumentType,
			Filename:     d.Filename,
			DownloadURL:  d.DownloadURL,
			GeneratedAt:  d.GeneratedAt.UTC().Format("2006-01-02T15:04:05Z"),
		})
	}
	response.JSON(w, http.StatusOK, map[string]any{"caseId": caseID, "items": items})
}

// Download handles GET /v1/documents/{documentId}/download.
func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	documentID := r.PathValue("documentId")
	doc, err := h.service.GetByID(r.Context(), documentID)
	if err != nil {
		response.Error(w, apperror.ErrNotFound)
		return
	}
	// Return document metadata for MVP (in production, redirect to signed GCS URL)
	response.JSON(w, http.StatusOK, map[string]any{
		"documentId":  doc.ID,
		"filename":    doc.Filename,
		"downloadUrl": doc.DownloadURL,
	})
}
