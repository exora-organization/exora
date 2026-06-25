package document

// pdf_template.go holds PDF layout definitions for export documents.
// Extend with a PDF library (e.g. gofpdf) for production use.
// Note: Document type constants have been moved to model.go (TypeQuotation etc.)
// TemplateProforma is re-exported there for backward compatibility.

type PDFTemplate struct {
	Name    string
	Headers []string
}

var Templates = map[string]PDFTemplate{
	TypeQuotation: {
		Name:    "Quotation",
		Headers: []string{"Seller", "Buyer", "Product", "Incoterm", "Price IDR", "Price USD"},
	},
	TypeProformaInvoice: {
		Name:    "Proforma Invoice",
		Headers: []string{"Seller", "Buyer", "Items", "Incoterm", "Total"},
	},
	TypeCostBreakdown: {
		Name:    "Cost Breakdown Report",
		Headers: []string{"Cost Component", "Amount (IDR)"},
	},
	TypeFeasibilityReport: {
		Name:    "Export Feasibility Report",
		Headers: []string{"Section", "Details"},
	},
}
