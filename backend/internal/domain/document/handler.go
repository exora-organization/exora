package document

import (
	"bytes"
	"fmt"
	"net/http"
	"strings"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/pkg/response"
	"github.com/jung-kurt/gofpdf/v2"
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
// Serves the document content as a downloadable attachment.
func (h *Handler) Download(w http.ResponseWriter, r *http.Request) {
	documentID := r.PathValue("documentId")
	doc, err := h.service.GetByID(r.Context(), documentID)
	if err != nil {
		response.Error(w, apperror.ErrNotFound)
		return
	}

	// If content is available, compile it to a valid PDF binary and serve it
	if len(doc.Content) > 0 {
		pdfBytes, err := textToPDF(doc.Filename, doc.Content)
		if err != nil {
			response.Error(w, apperror.New("INTERNAL", "failed to render PDF binary", 500))
			return
		}

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, doc.Filename))
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		w.Write(pdfBytes)
		return
	}

	// Fallback: return metadata (legacy docs without stored content)
	response.JSON(w, http.StatusOK, map[string]any{
		"documentId":  doc.ID,
		"filename":    doc.Filename,
		"downloadUrl": doc.DownloadURL,
	})
}

// textToPDF converts monospaced plain text content into a valid PDF binary using Courier font.
func textToPDF(filename string, content []byte) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()
	pdf.SetFont("Courier", "", 10)
	
	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		// Replace tab characters with spaces for formatting alignment
		line = strings.ReplaceAll(line, "\t", "    ")
		pdf.CellFormat(0, 5, line, "", 1, "L", false, 0, "")
	}
	
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// Preview handles GET /v1/documents/{documentId}/preview.
// Serves the document content inline for browser preview.
func (h *Handler) Preview(w http.ResponseWriter, r *http.Request) {
	documentID := r.PathValue("documentId")
	doc, err := h.service.GetByID(r.Context(), documentID)
	if err != nil {
		response.Error(w, apperror.ErrNotFound)
		return
	}

	if len(doc.Content) == 0 {
		response.Error(w, apperror.ErrNotFound)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, doc.Filename))
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusOK)
	w.Write(doc.Content)
}

