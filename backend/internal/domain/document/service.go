package document

import (
	"bytes"
	"context"
	"fmt"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/advisor"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/pricing"
	"github.com/exora/backend/internal/domain/risk"
)

// Service handles document generation (SRS FR-020–FR-023).
// Each document type has specific prerequisite data requirements (SRS §7).
type Service struct {
	repo        Repository
	costingRepo costing.Repository
	pricingRepo pricing.Repository
	riskRepo    risk.Repository
	advisorRepo advisor.Repository
	caseRepo    exportcase.Repository
	appBaseURL  string
}

func NewService(
	repo Repository,
	costingRepo costing.Repository,
	pricingRepo pricing.Repository,
	riskRepo risk.Repository,
	advisorRepo advisor.Repository,
	caseRepo exportcase.Repository,
	appBaseURL string,
) *Service {
	return &Service{
		repo:        repo,
		costingRepo: costingRepo,
		pricingRepo: pricingRepo,
		riskRepo:    riskRepo,
		advisorRepo: advisorRepo,
		caseRepo:    caseRepo,
		appBaseURL:  appBaseURL,
	}
}

// GenerateQuotation generates SRS FR-020: Quotation document.
// Requires: export_case + cost_data + pricing_results.
func (s *Service) GenerateQuotation(ctx context.Context, caseID, companyID string) (*GenerateResult, error) {
	ec, cd, pr, err := s.requireCostAndPricing(ctx, caseID)
	if err != nil {
		return nil, err
	}
	content := renderQuotation(ec, cd, pr)
	return s.saveDocument(ctx, caseID, companyID, TypeQuotation, content)
}

// GenerateProforma generates SRS FR-021: Proforma Invoice.
// Requires: export_case + cost_data + pricing_results.
func (s *Service) GenerateProforma(ctx context.Context, caseID, companyID string) (*GenerateResult, error) {
	ec, cd, pr, err := s.requireCostAndPricing(ctx, caseID)
	if err != nil {
		return nil, err
	}
	content := renderProforma(ec, cd, pr)
	return s.saveDocument(ctx, caseID, companyID, TypeProformaInvoice, content)
}

// GenerateCostBreakdown generates SRS FR-022: Cost Breakdown Report.
// Requires: export_case + cost_data + pricing_results.
func (s *Service) GenerateCostBreakdown(ctx context.Context, caseID, companyID string) (*GenerateResult, error) {
	ec, cd, pr, err := s.requireCostAndPricing(ctx, caseID)
	if err != nil {
		return nil, err
	}
	content := renderCostBreakdown(ec, cd, pr)
	return s.saveDocument(ctx, caseID, companyID, TypeCostBreakdown, content)
}

// GenerateFeasibility generates SRS FR-023: Export Feasibility Report.
// Requires: all prerequisites including risk_assessment + advisor_recommendations.
func (s *Service) GenerateFeasibility(ctx context.Context, caseID, companyID string) (*GenerateResult, error) {
	ec, cd, pr, err := s.requireCostAndPricing(ctx, caseID)
	if err != nil {
		return nil, err
	}

	ra, err := s.riskRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: risk_assessment required (run GET /risk-assessment first)", 422)
	}

	rec, err := s.advisorRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: advisor_recommendations required (run POST /advisor/recommendations first)", 422)
	}

	content := renderFeasibility(ec, cd, pr, ra, rec)
	return s.saveDocument(ctx, caseID, companyID, TypeFeasibilityReport, content)
}

// ListByCase returns all document metadata for a case.
func (s *Service) ListByCase(ctx context.Context, caseID string) ([]*Document, error) {
	return s.repo.ListByCaseID(ctx, caseID)
}

// GetByID retrieves a document by its document ID.
func (s *Service) GetByID(ctx context.Context, documentID string) (*Document, error) {
	return s.repo.GetByID(ctx, documentID)
}

// requireCostAndPricing is a shared prerequisite loader for most document types.
func (s *Service) requireCostAndPricing(ctx context.Context, caseID string) (*exportcase.ExportCase, *costing.CostData, *pricing.PricingResult, error) {
	ec, err := s.caseRepo.GetByID(ctx, caseID)
	if err != nil {
		return nil, nil, nil, err
	}
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, nil, nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data required", 422)
	}
	pr, err := s.pricingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, nil, nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: pricing_results required (run POST /pricing/calculate first)", 422)
	}
	return ec, cd, pr, nil
}

func (s *Service) saveDocument(ctx context.Context, caseID, companyID, docType string, content []byte) (*GenerateResult, error) {
	filename := fmt.Sprintf("exora_%s_%s.pdf", docType, caseID)
	doc := &Document{
		CaseID:       caseID,
		CompanyID:    companyID,
		DocumentType: docType,
		Filename:     filename,
		DownloadURL:  fmt.Sprintf("%s/v1/documents/%%s/download", s.appBaseURL), // filled after create
	}
	if err := s.repo.Create(ctx, doc); err != nil {
		return nil, err
	}
	// Update downloadUrl with actual document ID
	doc.DownloadURL = fmt.Sprintf("%s/v1/documents/%s/download", s.appBaseURL, doc.ID)
	return &GenerateResult{Document: doc, Content: content}, nil
}

// ─── Template renderers ────────────────────────────────────────────────────────

func renderQuotation(ec *exportcase.ExportCase, cd *costing.CostData, pr *pricing.PricingResult) []byte {
	var buf bytes.Buffer
	buf.WriteString("EXORA — QUOTATION\n")
	buf.WriteString(fmt.Sprintf("Case: %s | Product: %s | Destination: %s\n", ec.Name, ec.Product, ec.DestinationCountry))
	buf.WriteString(fmt.Sprintf("Incoterm: %s\n", pr.Incoterm))
	buf.WriteString(fmt.Sprintf("Selling Price (IDR): %.2f\n", pr.SellingPriceIDR))
	buf.WriteString(fmt.Sprintf("Selling Price (USD): %.2f\n", pr.SellingPriceUSD))
	buf.WriteString(fmt.Sprintf("Exchange Rate: %.0f IDR/USD\n", cd.ExchangeRate))
	buf.WriteString(fmt.Sprintf("Quantity: %.0f units\n", cd.Quantity))
	buf.WriteString(fmt.Sprintf("Payment Term: %s\n", cd.PaymentTerm))
	return buf.Bytes()
}

func renderProforma(ec *exportcase.ExportCase, cd *costing.CostData, pr *pricing.PricingResult) []byte {
	var buf bytes.Buffer
	buf.WriteString("EXORA — PROFORMA INVOICE\n")
	buf.WriteString(fmt.Sprintf("Case: %s | Product: %s\n", ec.Name, ec.Product))
	buf.WriteString(fmt.Sprintf("Destination: %s | Incoterm: %s\n", ec.DestinationCountry, pr.Incoterm))
	buf.WriteString(fmt.Sprintf("Unit Price (IDR): %.2f | Unit Price (USD): %.4f\n", pr.SellingPriceIDR, pr.SellingPriceUSD))
	buf.WriteString(fmt.Sprintf("Quantity: %.0f | Total Value (USD): %.2f\n", cd.Quantity, pr.SellingPriceUSD*cd.Quantity))
	buf.WriteString(fmt.Sprintf("Payment Term: %s\n", cd.PaymentTerm))
	return buf.Bytes()
}

func renderCostBreakdown(ec *exportcase.ExportCase, cd *costing.CostData, pr *pricing.PricingResult) []byte {
	var buf bytes.Buffer
	buf.WriteString("EXORA — COST BREAKDOWN REPORT\n")
	buf.WriteString(fmt.Sprintf("Case: %s | Incoterm: %s\n\n", ec.Name, pr.Incoterm))
	buf.WriteString(fmt.Sprintf("HPP (Production Cost):    %12.2f IDR\n", cd.HPP))
	buf.WriteString(fmt.Sprintf("Packaging:                %12.2f IDR\n", cd.Packaging))
	buf.WriteString(fmt.Sprintf("Certification:            %12.2f IDR\n", cd.Certification))
	buf.WriteString(fmt.Sprintf("Transportation:           %12.2f IDR\n", cd.Transportation))
	buf.WriteString(fmt.Sprintf("Freight:                  %12.2f IDR\n", cd.Freight))
	buf.WriteString(fmt.Sprintf("Insurance:                %12.2f IDR\n", cd.Insurance))
	buf.WriteString(fmt.Sprintf("──────────────────────────────────────\n"))
	buf.WriteString(fmt.Sprintf("Total Cost (Incoterm):    %12.2f IDR\n", pr.TotalCostIDR))
	buf.WriteString(fmt.Sprintf("Target Margin:            %12.1f%%\n", cd.TargetMargin))
	buf.WriteString(fmt.Sprintf("Profit:                   %12.2f IDR\n", pr.ProfitIDR))
	buf.WriteString(fmt.Sprintf("Selling Price:            %12.2f IDR / %.4f USD\n", pr.SellingPriceIDR, pr.SellingPriceUSD))
	return buf.Bytes()
}

func renderFeasibility(ec *exportcase.ExportCase, cd *costing.CostData, pr *pricing.PricingResult, ra *risk.RiskAssessment, rec *advisor.AdvisorRecommendation) []byte {
	var buf bytes.Buffer
	buf.WriteString("EXORA — EXPORT FEASIBILITY REPORT\n\n")
	buf.WriteString(fmt.Sprintf("Case: %s | Product: %s | Destination: %s\n\n", ec.Name, ec.Product, ec.DestinationCountry))
	buf.WriteString("=== PRICING SUMMARY ===\n")
	buf.WriteString(fmt.Sprintf("Incoterm: %s | Total Cost: %.2f IDR | Selling Price: %.2f IDR (%.4f USD)\n\n",
		pr.Incoterm, pr.TotalCostIDR, pr.SellingPriceIDR, pr.SellingPriceUSD))
	buf.WriteString("=== RISK ASSESSMENT ===\n")
	buf.WriteString(fmt.Sprintf("Country Risk: %s (Score: %.0f)\n", ra.CountryRiskLevel, ra.CountryRiskScore))
	buf.WriteString(fmt.Sprintf("Payment Term: %s (Score: %.0f)\n", ra.PaymentTerm, ra.PaymentTermScore))
	buf.WriteString(fmt.Sprintf("Profitability Score: %.0f\n", ra.ProfitabilityScore))
	buf.WriteString(fmt.Sprintf("Feasibility Score: %.1f → %s\n\n", ra.FeasibilityScore, ra.FeasibilityClass))
	buf.WriteString("=== AI ADVISOR RECOMMENDATION ===\n")
	buf.WriteString(rec.Answer)
	_ = cd
	return buf.Bytes()
}
