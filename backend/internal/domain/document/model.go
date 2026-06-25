package document

import "time"

// Document type constants per SRS FR-020–FR-023.
const (
	TypeQuotation         = "quotation"
	TypeProformaInvoice   = "proforma_invoice"
	TypeCostBreakdown     = "cost_breakdown_report"
	TypeFeasibilityReport = "export_feasibility_report"
)

// TemplateProforma is kept for backward compatibility with existing handler references.
const TemplateProforma = TypeProformaInvoice

// Document is the Firestore model for the documents collection.
type Document struct {
	ID           string    `json:"-" firestore:"-"`
	CaseID       string    `json:"caseId" firestore:"caseId"`
	CompanyID    string    `json:"companyId" firestore:"companyId"`
	DocumentType string    `json:"documentType" firestore:"documentType"`
	Filename     string    `json:"filename" firestore:"filename"`
	// In a real system, downloadUrl would be a signed GCS URL.
	// For MVP, we return a stable backend URL.
	DownloadURL  string    `json:"downloadUrl" firestore:"downloadUrl"`
	GeneratedAt  time.Time `json:"generatedAt" firestore:"generatedAt"`
}

// DocumentListItem is a summary for GET /documents.
type DocumentListItem struct {
	DocumentID   string `json:"documentId"`
	CaseID       string `json:"caseId"`
	DocumentType string `json:"documentType"`
	Filename     string `json:"filename"`
	DownloadURL  string `json:"downloadUrl"`
	GeneratedAt  string `json:"generatedAt"`
}

// GenerateResult is the internal result returned after generation.
type GenerateResult struct {
	Document *Document
	Content  []byte
}
