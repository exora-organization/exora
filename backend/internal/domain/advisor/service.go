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
		query = fmt.Sprintf("export feasibility for %s to %s", ec.Product, ec.DestinationCountry)
	}
	snippets, _ := s.kb.Search(query, 3)
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
Analyze the following export case data and provide actionable recommendations.

=== EXPORT CASE CONTEXT ===
%s

=== KNOWLEDGE BASE ===
%s

=== QUESTION ===
%s

Provide a concise, structured recommendation covering:
1. Export feasibility assessment
2. Key risks and mitigation strategies  
3. Recommended next steps
4. Any pricing or cost optimizations

Keep the response practical and specific to the provided data.`, contextSummary, kbContext, question)
}

func snippetSources(snippets []string) []string {
	sources := make([]string, len(snippets))
	for i := range snippets {
		sources[i] = fmt.Sprintf("knowledge-base snippet %d", i+1)
	}
	return sources
}
