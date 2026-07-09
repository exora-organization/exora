package advisor

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/pricing"
	"github.com/exora/backend/internal/platform/gemini"
)

// Service handles the AI Decision Advisor (SRS FR-017, FR-018).
// Prerequisite: cost_data MUST exist (TC-AI-001 → 422 if missing).
type Service struct {
	gemini      *gemini.Client
	kb          *KnowledgeBase
	repo        Repository
	costingRepo costing.Repository
	pricingRepo pricing.Repository
	caseRepo    exportcase.Repository
}

func NewService(
	geminiClient *gemini.Client,
	kb *KnowledgeBase,
	repo Repository,
	costingRepo costing.Repository,
	pricingRepo pricing.Repository,
	caseRepo exportcase.Repository,
) *Service {
	return &Service{
		gemini:      geminiClient,
		kb:          kb,
		repo:        repo,
		costingRepo: costingRepo,
		pricingRepo: pricingRepo,
		caseRepo:    caseRepo,
	}
}

// Generate checks prerequisites, builds a rich context prompt, calls Gemini,
// and persists the recommendation (overwrite semantics).
// TC-AI-001: returns 422 UNPROCESSABLE if cost_data is missing.
func (s *Service) Generate(ctx context.Context, caseID, companyID string, req GenerateRequest) (*AdvisorRecommendation, error) {
	// Prerequisite check (TC-AI-001)
	cd, err := s.costingRepo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, apperror.New("UNPROCESSABLE", "prerequisite_data_missing: cost_data must be saved before generating AI recommendations", 422)
	}

	ec, _ := s.caseRepo.GetByID(ctx, caseID)
	pr, _ := s.pricingRepo.GetByCaseID(ctx, caseID)

	// Build context summary from case data
	contextSummary := buildContextSummary(ec, cd, pr)

	// RAG retrieval
	query := req.Question
	if query == "" {
		query = fmt.Sprintf("Evaluate the export feasibility of %s to %s with the provided cost, pricing, and payment terms.", ec.Product, ec.DestinationCountry)
	}
	snippets, _ := s.kb.Search(query, 5)
	kbContext := s.kb.BuildContext(snippets)

	// Compose prompt
	prompt := buildPrompt(contextSummary, kbContext, query)

	// Call Gemini with 10-second SLA (NFR-003)
	timeoutCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	answer, err := s.gemini.Generate(timeoutCtx, prompt)
	if err != nil {
		if timeoutCtx.Err() != nil {
			return nil, apperror.ErrAITimeout
		}
		return nil, apperror.New("ADVISOR_ERROR", "AI generation failed: "+err.Error(), 502)
	}

	confidence := "low"
	if len(snippets) > 0 {
		confidence = "high"
	} else if answer != "" {
		confidence = "medium"
	}

	rec := &AdvisorRecommendation{
		CaseID:         caseID,
		CompanyID:      companyID,
		Answer:         answer,
		Sources:        snippetSources(snippets),
		Confidence:     confidence,
		ContextSummary: contextSummary,
	}

	// Persist (upsert — overwrite on regenerate per SRS §9.1)
	if err := s.repo.Upsert(ctx, rec); err != nil {
		return nil, err
	}
	return rec, nil
}

// GetRecommendation retrieves the stored recommendation for a case.
func (s *Service) GetRecommendation(ctx context.Context, caseID string) (*AdvisorRecommendation, error) {
	return s.repo.GetByCaseID(ctx, caseID)
}

func (s *Service) GenerateGlobal(ctx context.Context, companyID string, req GenerateRequest) (*AdvisorRecommendation, error) {
	// 1. Fetch all export cases for the company (up to 1000)
	cases, _, err := s.caseRepo.ListByCompany(ctx, companyID, 1000, "")
	if err != nil {
		return nil, err
	}

	// 2. Build context summary from cases
	var parts []string
	parts = append(parts, fmt.Sprintf("Company Profile Summary: Total Cases = %d", len(cases)))

	for i, ec := range cases {
		cd, _ := s.costingRepo.GetByCaseID(ctx, ec.ID)
		pr, _ := s.pricingRepo.GetByCaseID(ctx, ec.ID)

		parts = append(parts, fmt.Sprintf("Case %d: Name=%s, Product=%s, Destination=%s, Status=%s",
			i+1, ec.Name, ec.Product, ec.DestinationCountry, ec.Status))

		if cd != nil {
			parts = append(parts, fmt.Sprintf("  Costing: HPP=%.0f, Packaging=%.0f, Transport=%.0f, Freight=%.0f, PaymentTerm=%s",
				cd.HPP, cd.Packaging, cd.Transportation, cd.Freight, cd.PaymentTerm))
		}
		if pr != nil {
			parts = append(parts, fmt.Sprintf("  Pricing: Incoterm=%s, SellingPriceUSD=%.2f, ActualMargin=%.1f%%",
				pr.Incoterm, pr.SellingPriceUSD, pr.ActualMarginPct))
		}
	}
	contextSummary := strings.Join(parts, "\n")

	// 3. Knowledge base search
	query := req.Question
	if query == "" {
		query = "global export strategies and trade finance"
	}
	snippets, _ := s.kb.Search(query, 5)
	kbContext := s.kb.BuildContext(snippets)

	// 4. Compose prompt
	prompt := fmt.Sprintf(`You are EXORA, an expert export trade decision advisor for Indonesian SMEs.
Analyze the following company-wide export profile and provide actionable company-wide strategic recommendations.

=== COMPANY EXPORT PROFILE CONTEXT ===
%s

=== KNOWLEDGE BASE ===
%s

=== QUESTION / FOCUS AREA ===
%s

When answering, do not reuse a fixed template. Be specific to the company's data and avoid generic recommendations.
Only use the provided case and knowledge base context.

Provide a focused, structured response covering:
1. Strategic priorities and feasibility across the company's export cases
2. Major risks, mitigations, and cashflow / payment recommendations
3. Next steps to strengthen execution or expand export activity
4. Pricing, incoterm, and cost optimization advice relevant to the existing cases

Keep the response practical, concrete, and directly tied to the provided data.`, contextSummary, kbContext, query)

	// 5. Call Gemini with 10s SLA
	timeoutCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	answer, err := s.gemini.Generate(timeoutCtx, prompt)
	if err != nil {
		if timeoutCtx.Err() != nil {
			return nil, apperror.ErrAITimeout
		}
		return nil, apperror.New("ADVISOR_ERROR", "AI generation failed: "+err.Error(), 502)
	}

	confidence := "low"
	if len(snippets) > 0 {
		confidence = "high"
	} else if answer != "" {
		confidence = "medium"
	}

	rec := &AdvisorRecommendation{
		CaseID:         "global",
		CompanyID:      companyID,
		Answer:         answer,
		Sources:        snippetSources(snippets),
		Confidence:     confidence,
		ContextSummary: contextSummary,
	}

	// Persist
	if err := s.repo.Upsert(ctx, rec); err != nil {
		return nil, err
	}
	return rec, nil
}

func (s *Service) GetGlobal(ctx context.Context, companyID string) (*AdvisorRecommendation, error) {
	return s.repo.GetGlobal(ctx, companyID)
}

func buildContextSummary(ec *exportcase.ExportCase, cd *costing.CostData, pr *pricing.PricingResult) string {
	parts := []string{}
	if ec != nil {
		parts = append(parts, fmt.Sprintf("Export Case: %s | Product: %s | Destination: %s | Status: %s",
			ec.Name, ec.Product, ec.DestinationCountry, ec.Status))
	}
	if cd != nil {
		parts = append(parts, fmt.Sprintf("Cost Data: HPP=%.0f IDR, Packaging=%.0f, Transportation=%.0f, Freight=%.0f, Insurance=%.0f | TargetMargin=%.1f%% | PaymentTerm=%s | ExchangeRate=%.0f",
			cd.HPP, cd.Packaging, cd.Transportation, cd.Freight, cd.Insurance, cd.TargetMargin, cd.PaymentTerm, cd.ExchangeRate))
	}
	if pr != nil {
		parts = append(parts, fmt.Sprintf("Pricing Result: Incoterm=%s | SellingPriceIDR=%.0f | SellingPriceUSD=%.2f | ActualMargin=%.1f%%",
			pr.Incoterm, pr.SellingPriceIDR, pr.SellingPriceUSD, pr.ActualMarginPct))
	}
	return strings.Join(parts, "\n")
}

func buildPrompt(contextSummary, kbContext, question string) string {
	return fmt.Sprintf(`You are EXORA, an expert export trade decision advisor for Indonesian SMEs.
Use the export case details and knowledge base context to answer the question directly.
Avoid repeating generic boilerplate or returning the same fixed structure each time.
Only base your recommendation on the data and knowledge provided.

=== EXPORT CASE CONTEXT ===
%s

=== KNOWLEDGE BASE ===
%s

=== QUESTION ===
%s

Answer with concrete advice that is specific to this export case.
If the question is about risk, discuss the most relevant risks and mitigation actions.
If it is about pricing, include the most important pricing or incoterm decision.
If it is about feasibility, make a clear judgment and mention the key factor driving that judgment.

Preferred format:
- Short summary statement
- 2-3 concrete action items
- One specific recommendation tied to the case data
`, contextSummary, kbContext, question)
}

func snippetSources(snippets []string) []string {
	sources := make([]string, len(snippets))
	for i := range snippets {
		sources[i] = fmt.Sprintf("knowledge-base snippet %d", i+1)
	}
	return sources
}
