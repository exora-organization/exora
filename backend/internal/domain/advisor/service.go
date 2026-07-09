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

	query := req.Question
	if query == "" {
		if ec != nil {
			query = fmt.Sprintf("Evaluate the export feasibility of %s to %s with the provided cost, pricing, and payment terms.", ec.Product, ec.DestinationCountry)
		} else {
			query = "Evaluate the export feasibility."
		}
	}

	// 1. Export Domain Check
	if !isExportDomain(query) && !isGreeting(query) {
		rec := &AdvisorRecommendation{
			CaseID:         caseID,
			CompanyID:      companyID,
			Answer:         outOfScopeResponse,
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		_ = s.repo.Upsert(ctx, rec)
		return rec, nil
	}

	// 2. Smart Country Validation
	countryToCheck := extractCountryFromQuery(query)
	if countryToCheck == "" && ec != nil {
		countryToCheck = ec.DestinationCountry
	}
	if isUnsupportedCountry(countryToCheck) {
		rec := &AdvisorRecommendation{
			CaseID:         caseID,
			CompanyID:      companyID,
			Answer:         "I don't have verified knowledge for exports to this country because it is not currently included in the curated knowledge base. Please consult official trade resources or an export specialist.",
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		_ = s.repo.Upsert(ctx, rec)
		return rec, nil
	}

	// 3. RAG Retrieval
	snippets, _ := s.kb.Search(query, 5)

	// 4. Coverage Check
	if len(snippets) == 0 && !isGreeting(query) {
		rec := &AdvisorRecommendation{
			CaseID:         caseID,
			CompanyID:      companyID,
			Answer:         "This topic is outside the curated knowledge base used for business recommendations. I can provide general information if helpful, but it should not be treated as an official recommendation.",
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		_ = s.repo.Upsert(ctx, rec)
		return rec, nil
	}

	// 5. Compose prompt
	kbContext := s.kb.BuildContext(snippets)
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

	// 6. Confidence Score
	confidence := "low"
	highestScore := 0
	if len(snippets) > 0 {
		highestScore = snippets[0].Score
	}
	if highestScore >= 30 {
		confidence = "high"
	} else if highestScore >= 10 {
		confidence = "medium"
	}

	// Build sources citations
	sources := make([]string, len(snippets))
	for i, doc := range snippets {
		sources[i] = doc.Title
	}

	rec := &AdvisorRecommendation{
		CaseID:         caseID,
		CompanyID:      companyID,
		Answer:         answer,
		Sources:        sources,
		Confidence:     confidence,
		ContextSummary: contextSummary,
		GeneratedAt:    time.Now(),
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

	query := req.Question
	if query == "" {
		query = "global export strategies and trade finance"
	}

	// 3. Export Domain Check
	if !isExportDomain(query) && !isGreeting(query) {
		rec := &AdvisorRecommendation{
			CaseID:         "global",
			CompanyID:      companyID,
			Answer:         outOfScopeResponse,
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		return rec, nil
	}

	// 4. Smart Country Validation
	countryToCheck := extractCountryFromQuery(query)
	if isUnsupportedCountry(countryToCheck) {
		rec := &AdvisorRecommendation{
			CaseID:         "global",
			CompanyID:      companyID,
			Answer:         "I don't have verified knowledge for exports to this country because it is not currently included in the curated knowledge base. Please consult official trade resources or an export specialist.",
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		return rec, nil
	}

	// 5. RAG Retrieval
	snippets, _ := s.kb.Search(query, 5)

	// 6. Coverage Check
	if len(snippets) == 0 && !isGreeting(query) {
		rec := &AdvisorRecommendation{
			CaseID:         "global",
			CompanyID:      companyID,
			Answer:         "This topic is outside the curated knowledge base used for business recommendations. I can provide general information if helpful, but it should not be treated as an official recommendation.",
			Confidence:     "low",
			ContextSummary: contextSummary,
			GeneratedAt:    time.Now(),
		}
		return rec, nil
	}

	// 7. Compose prompt
	kbContext := s.kb.BuildContext(snippets)
	prompt := fmt.Sprintf(`You are EXORA, an expert export trade decision advisor for Indonesian SMEs.
Analyze the following company-wide export profile and provide actionable company-wide strategic recommendations.

=== COMPANY EXPORT PROFILE CONTEXT ===
%s

=== CURATED KNOWLEDGE BASE ===
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

	// 8. Call Gemini with 10-second SLA (NFR-003)
	timeoutCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	answer, err := s.gemini.Generate(timeoutCtx, prompt)
	if err != nil {
		if timeoutCtx.Err() != nil {
			return nil, apperror.ErrAITimeout
		}
		return nil, apperror.New("ADVISOR_ERROR", "AI generation failed: "+err.Error(), 502)
	}

	// 9. Confidence Score
	confidence := "low"
	highestScore := 0
	if len(snippets) > 0 {
		highestScore = snippets[0].Score
	}
	if highestScore >= 30 {
		confidence = "high"
	} else if highestScore >= 10 {
		confidence = "medium"
	}

	// Build sources citations
	sources := make([]string, len(snippets))
	for i, doc := range snippets {
		sources[i] = doc.Title
	}

	rec := &AdvisorRecommendation{
		CaseID:         "global",
		CompanyID:      companyID,
		Answer:         answer,
		Sources:        sources,
		Confidence:     confidence,
		ContextSummary: contextSummary,
		GeneratedAt:    time.Now(),
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
Your knowledge is strictly limited to the curated export knowledge base provided below.
You must NOT make autonomous business decisions or provide unsupported recommendations.

=== EXPORT CASE CONTEXT ===
%s

=== CURATED KNOWLEDGE BASE ===
%s

=== USER QUESTION ===
%s

CRITICAL INSTRUCTIONS FOR OUT-OF-SCOPE AND COVERAGE LIMITATIONS:
1. If the user's question is about a country or topic that is NOT covered by the curated knowledge base above, or is outside the export decision domain, you MUST respond exactly in the following way to guide the user:
   "This question is outside the scope of the AI Decision Advisor.

I can assist with:
• Assess the export risk for Indonesia to Japan.
• Recommend suitable payment terms for a new buyer.
• Compare FOB and CIF for this shipment.
• Explain the required export documents.
• Recommend an appropriate trade finance method.
• Identify key considerations when exporting to Vietnam.

Please choose one of these topics or ask another export-related question."
2. Avoid generating unsupported business recommendations or conclusions.
3. If providing general informational guidance, clearly indicate that the information is not part of the curated knowledge base and should not be considered an official business recommendation.
4. When the question is within the scope and covered, answer with concrete advice that is specific to this export case, with the following preferred format:
   - Short summary statement
   - 2-3 concrete action items
   - One specific recommendation tied to the case data
`, contextSummary, kbContext, question)
}

const outOfScopeResponse = `This question is outside the scope of the AI Decision Advisor.

I can assist with:
• Assess the export risk for Indonesia to Japan.
• Recommend suitable payment terms for a new buyer.
• Compare FOB and CIF for this shipment.
• Explain the required export documents.
• Recommend an appropriate trade finance method.
• Identify key considerations when exporting to Vietnam.

Please choose one of these topics or ask another export-related question.`

func isExportDomain(query string) bool {
	queryLower := strings.ToLower(query)
	// Broad vocabulary of export/trade domain terms
	domainVocab := map[string]bool{
		"export": true, "exporter": true, "ekspor": true, "import": true, "impor": true,
		"buyer": true, "supplier": true, "shipment": true, "incoterm": true, "fob": true,
		"cif": true, "lc": true, "tt": true, "payment": true, "freight": true, "trade": true,
		"finance": true, "customs": true, "commodity": true, "feasibility": true, "risk": true,
		"risiko": true, "logistics": true, "cargo": true, "document": true, "dokumen": true,
		"compliance": true, "regulasi": true, "regulation": true, "tariff": true, "tax": true,
		"pabean": true, "advisory": true, "recommendation": true, "korea": true, "singapore": true,
		"singapura": true, "malaysia": true, "thailand": true, "vietnam": true, "usa": true,
		"india": true, "japan": true, "jepang": true, "china": true, "cina": true,
		"uae": true, "indonesia": true,
	}

	// Tokenize query
	words := strings.FieldsFunc(queryLower, func(r rune) bool {
		return !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9'))
	})

	score := 0
	for _, w := range words {
		if domainVocab[w] {
			score++
		}
	}

	// Also check common multi-word phrases
	phrases := []string{
		"letter of credit", "payment term", "trade finance", "bill of lading",
		"certificate of origin", "destination country", "marine insurance", "cargo insurance",
	}
	for _, p := range phrases {
		if strings.Contains(queryLower, p) {
			score += 2
		}
	}

	return score > 0
}

func isGreeting(query string) bool {
	q := strings.TrimSpace(strings.ToLower(query))
	return q == "hi" || q == "hello" || q == "halo" || q == "hey"
}

func extractCountryFromQuery(query string) string {
	queryLower := strings.ToLower(query)
	countries := []string{
		"south korea", "korea", "singapore", "singapura", "malaysia", "thailand",
		"vietnam", "usa", "america", "india", "japan", "jepang", "china", "cina",
		"uae", "emirat", "indonesia", "germany", "jerman", "france", "prancis",
		"brazil", "russia", "rusia", "australia", "uk", "united kingdom", "inggris",
		"canada", "kanada", "italy", "italia", "spain", "spanyol", "mexico", "meksiko",
	}
	for _, c := range countries {
		if hasWordBoundary(queryLower, c) {
			return c
		}
	}
	return ""
}

func isUnsupportedCountry(country string) bool {
	if country == "" {
		return false
	}
	c := strings.ToLower(country)
	supported := map[string]bool{
		"south korea": true, "south_korea": true, "korea": true,
		"singapore": true, "singapura": true, "malaysia": true, "thailand": true,
		"vietnam": true, "usa": true, "america": true, "india": true,
		"japan": true, "jepang": true, "china": true, "cina": true,
		"uae": true, "emirat": true, "indonesia": true,
	}
	return !supported[c]
}

func hasWordBoundary(text, word string) bool {
	idx := strings.Index(text, word)
	if idx == -1 {
		return false
	}
	for idx != -1 {
		startOK := idx == 0 || !isAlphaNumByte(text[idx-1])
		endOK := idx+len(word) == len(text) || !isAlphaNumByte(text[idx+len(word)])
		if startOK && endOK {
			return true
		}
		nextIdx := strings.Index(text[idx+1:], word)
		if nextIdx == -1 {
			break
		}
		idx = idx + 1 + nextIdx
	}
	return false
}

func isAlphaNumByte(c byte) bool {
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
}
