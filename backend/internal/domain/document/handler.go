package document

import (
	"bytes"
	"fmt"
	"net/http"
	"regexp"
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

// textToPDF converts plain text content into a professional PDF binary.
func textToPDF(filename string, content []byte) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 20, 20)
	pdf.AddPage()

	// Add EXORA Logo box
	pdf.SetFont("Arial", "B", 16)
	pdf.SetFillColor(0, 166, 81)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(40, 12, " EXORA ", "0", 1, "C", true, 0, "")
	pdf.Ln(8)

	// Clean up UTF-8 characters not supported by standard gofpdf fonts
	contentStr := string(content)
	contentStr = strings.ReplaceAll(contentStr, "—", "-")
	contentStr = strings.ReplaceAll(contentStr, "”", "\"")
	contentStr = strings.ReplaceAll(contentStr, "“", "\"")
	contentStr = strings.ReplaceAll(contentStr, "’", "'")
	contentStr = strings.ReplaceAll(contentStr, "‘", "'")
	contentStr = strings.ReplaceAll(contentStr, "→", "->")
	contentStr = strings.ReplaceAll(contentStr, "•", "-")

	tableRegex := regexp.MustCompile(`:\s{2,}`)

	lines := strings.Split(contentStr, "\n")
	for _, line := range lines {
		line = strings.ReplaceAll(line, "\t", "    ")

		isMainHeader := strings.HasPrefix(line, "EXORA -")
		isSectionHeader := strings.HasPrefix(line, "===")
		isDivider := strings.Contains(line, "────────")

		if isMainHeader {
			pdf.SetFont("Arial", "B", 15)
			pdf.SetTextColor(0, 100, 50)
			pdf.CellFormat(0, 8, line, "", 1, "L", false, 0, "")
			
			// Draw thick green line
			pdf.SetDrawColor(0, 166, 81)
			pdf.SetLineWidth(0.8)
			x, y := pdf.GetXY()
			pdf.Line(x, y, x+170, y)
			pdf.Ln(5)
			continue
		}

		if isSectionHeader {
			pdf.Ln(4)
			pdf.SetFont("Arial", "B", 11)
			pdf.SetTextColor(0, 100, 50)
			pdf.SetFillColor(235, 248, 242)
			text := strings.TrimSpace(strings.ReplaceAll(line, "=", ""))
			pdf.CellFormat(0, 8, "  "+text, "0", 1, "L", true, 0, "")
			pdf.Ln(2)
			continue
		}

		if isDivider {
			pdf.SetDrawColor(200, 200, 200)
			pdf.SetLineWidth(0.2)
			x, y := pdf.GetXY()
			pdf.Line(x, y+2, x+170, y+2)
			pdf.Ln(4)
			continue
		}

		if strings.HasPrefix(line, "## ") {
			pdf.Ln(3)
			pdf.SetFont("Arial", "B", 12)
			pdf.SetTextColor(0, 0, 0)
			pdf.CellFormat(0, 8, strings.TrimPrefix(line, "## "), "", 1, "L", false, 0, "")
			continue
		}

		// Badges (Case: X | Product: Y)
		if strings.Contains(line, " | ") && !strings.Contains(line, ":") || (strings.Contains(line, " | ") && strings.Count(line, "|") > 0 && !tableRegex.MatchString(line)) {
			// Actually, just checking strings.Contains(line, " | ") is fine since we know the format.
			pdf.SetFont("Arial", "B", 9)
			pdf.SetTextColor(100, 100, 100)
			badges := strings.Split(line, " | ")
			for _, b := range badges {
				b = strings.TrimSpace(b)
				pdf.SetFillColor(245, 245, 245)
				w := pdf.GetStringWidth(b) + 6
				if pdf.GetX()+w > 190 {
					pdf.Ln(8)
				}
				pdf.CellFormat(w, 6, b, "1", 0, "C", true, 0, "")
				pdf.SetXY(pdf.GetX()+2, pdf.GetY()) // space between badges
			}
			pdf.Ln(8)
			continue
		}

		// Tabular Data
		if strings.Contains(line, ":") && tableRegex.MatchString(line) {
			parts := tableRegex.Split(line, 2)
			label := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])

			pdf.SetFont("Arial", "", 10)
			pdf.SetTextColor(100, 100, 100)
			pdf.CellFormat(80, 7, label, "B", 0, "L", false, 0, "")

			pdf.SetFont("Arial", "B", 10)
			pdf.SetTextColor(0, 0, 0)
			pdf.CellFormat(0, 7, value, "B", 1, "R", false, 0, "")
			continue
		}

		// Check for empty lines
		if strings.TrimSpace(line) == "" {
			pdf.Ln(3)
			continue
		}

		pdf.SetTextColor(60, 60, 60)
		if strings.Contains(line, "**") {
			parts := strings.Split(line, "**")
			for i, p := range parts {
				if i%2 == 1 {
					pdf.SetFont("Arial", "B", 10)
					pdf.SetTextColor(0, 0, 0)
				} else {
					pdf.SetFont("Arial", "", 10)
					pdf.SetTextColor(60, 60, 60)
				}
				pdf.Write(5, p)
			}
			pdf.Ln(5)
		} else {
			pdf.SetFont("Arial", "", 10)
			pdf.MultiCell(0, 5, line, "", "L", false)
		}
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

