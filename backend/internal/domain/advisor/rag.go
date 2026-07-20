package advisor

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type Document struct {
	Title   string
	Source  string
	Content string
	Score   int
}

type KnowledgeBase struct {
	root string
}

func NewKnowledgeBase(root string) *KnowledgeBase {
	return &KnowledgeBase{root: root}
}

func (kb *KnowledgeBase) Search(query string, maxResults int) ([]Document, error) {
	if maxResults <= 0 {
		maxResults = 3
	}

	query = strings.ToLower(query)
	// Split query into lowercase alphanumeric words
	words := strings.FieldsFunc(query, func(r rune) bool {
		return !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9'))
	})

	// Filter out common stop words to keep only relevant keywords
	stopWords := map[string]bool{
		"can": true, "should": true, "could": true, "would": true, "please": true,
		"tell": true, "give": true, "show": true, "recommend": true, "suggest": true,
		"what": true, "how": true, "why": true, "where": true, "when": true,
		"who": true, "which": true, "this": true, "that": true, "these": true,
		"those": true, "the": true, "and": true, "for": true, "with": true,
		"from": true, "your": true, "our": true, "my": true, "their": true,
		"his": true, "her": true, "its": true, "about": true, "evaluate": true,
		"export": true, "feasibility": true, "of": true, "provided": true,
		"to": true, "is": true, "are": true, "am": true, "was": true, "were": true,
		"be": true, "been": true, "being": true, "in": true, "on": true, "at": true,
		"an": true, "a": true, "do": true, "does": true, "did": true, "done": true,
		"doing": true, "gimana": true, "di": true, "ke": true,
	}

	var searchTerms []string
	for _, w := range words {
		w = strings.ToLower(w)
		if len(w) > 2 && !stopWords[w] {
			searchTerms = append(searchTerms, w)
		}
	}

	// Fallback to using all words longer than 2 characters if no keywords left
	if len(searchTerms) == 0 {
		for _, w := range words {
			w = strings.ToLower(w)
			if len(w) > 2 {
				searchTerms = append(searchTerms, w)
			}
		}
	}

	var candidates []Document

	dirs := []string{
		filepath.Join(kb.root, "countries"),
		filepath.Join(kb.root, "trade-finance"),
	}

	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			path := filepath.Join(dir, e.Name())
			content, err := os.ReadFile(path)
			if err != nil {
				continue
			}
			text := string(content)
			textLower := strings.ToLower(text)
			fileNameLower := strings.ToLower(e.Name())

			score := 0
			// Calculate score based on word-boundary matching of search terms
			for _, term := range searchTerms {
				if hasWord(textLower, term) {
					score += 10 // Content match
				}
				if hasWord(fileNameLower, term) {
					score += 10 // Filename/Title match (balanced weight)
				}
			}

			// Relevance threshold: minimum score of 10
			if score >= 10 {
				doc := parseDocument(path, content)
				doc.Score = score
				candidates = append(candidates, doc)
			}
		}
	}

	if len(candidates) == 0 {
		return nil, nil
	}

	// Sort candidates by score descending
	for i := 0; i < len(candidates); i++ {
		for j := i + 1; j < len(candidates); j++ {
			if candidates[i].Score < candidates[j].Score {
				candidates[i], candidates[j] = candidates[j], candidates[i]
			}
		}
	}

	// Similarity threshold: only return docs with score >= 50% of the highest score
	highestScore := candidates[0].Score
	threshold := highestScore / 2

	var results []Document
	for _, cand := range candidates {
		if cand.Score >= threshold {
			results = append(results, cand)
			if len(results) >= maxResults {
				break
			}
		}
	}

	return results, nil
}

func (kb *KnowledgeBase) BuildContext(docs []Document) string {
	var parts []string
	for _, doc := range docs {
		parts = append(parts, fmt.Sprintf("Source: %s (Provider: %s)\nContent:\n%s", doc.Title, doc.Source, doc.Content))
	}
	return strings.Join(parts, "\n\n---\n\n")
}

// ── JSON schema structs ──────────────────────────────────────────────────────

// countryKBFile maps the full structure of a country knowledge-base JSON file.
type countryKBFile struct {
	Title  string `json:"title"`
	Source string `json:"source"`
	Content struct {
		Country           string   `json:"country"`
		RiskLevel         string   `json:"riskLevel"`
		Summary           string   `json:"summary"`
		Currency          string   `json:"currency"`
		PaymentPreference string   `json:"paymentPreference"`
		BestPractices     []string `json:"bestPractices"`
		ExportRequirements []string `json:"exportRequirements"`
		LeadTime          string   `json:"leadTime"`
	} `json:"content"`
}

// tradeFinanceTerm maps a single payment term entry.
type tradeFinanceTerm struct {
	Name        string `json:"name"`
	RiskScore   int    `json:"riskScore"`
	RiskLevel   string `json:"riskLevel"`
	Description string `json:"description"`
	BestFor     string `json:"bestFor"`
	Drawbacks   string `json:"drawbacks"`
}

// tradeFinanceKBFile maps the full structure of a trade-finance knowledge-base JSON file.
type tradeFinanceKBFile struct {
	Title  string `json:"title"`
	Source string `json:"source"`
	Content struct {
		Title           string             `json:"title"`
		Terms           []tradeFinanceTerm `json:"terms"`
		Recommendations struct {
			NewBuyer         string `json:"newBuyer"`
			EstablishedBuyer string `json:"establishedBuyer"`
			HighRiskCountry  string `json:"highRiskCountry"`
			ExportInsurance  string `json:"exportInsurance"`
		} `json:"recommendations"`
	} `json:"content"`
}

// ── Document flattening ──────────────────────────────────────────────────────

// flattenCountryDoc converts a parsed countryKBFile into human-readable prose
// that the LLM can consume as grounded context.
func flattenCountryDoc(doc countryKBFile) string {
	var sb strings.Builder
	c := doc.Content
	sb.WriteString(fmt.Sprintf("Country: %s\n", c.Country))
	sb.WriteString(fmt.Sprintf("Risk Level: %s\n", c.RiskLevel))
	sb.WriteString(fmt.Sprintf("Currency: %s\n", c.Currency))
	sb.WriteString(fmt.Sprintf("Summary: %s\n", c.Summary))
	sb.WriteString(fmt.Sprintf("Payment Preference: %s\n", c.PaymentPreference))
	sb.WriteString(fmt.Sprintf("Typical Lead Time: %s\n", c.LeadTime))
	if len(c.BestPractices) > 0 {
		sb.WriteString("Best Practices:\n")
		for _, bp := range c.BestPractices {
			sb.WriteString(fmt.Sprintf("  - %s\n", bp))
		}
	}
	if len(c.ExportRequirements) > 0 {
		sb.WriteString("Required Export Documents:\n")
		for _, req := range c.ExportRequirements {
			sb.WriteString(fmt.Sprintf("  - %s\n", req))
		}
	}
	return strings.TrimRight(sb.String(), "\n")
}

// flattenTradeFinanceDoc converts a parsed tradeFinanceKBFile into human-readable prose.
func flattenTradeFinanceDoc(doc tradeFinanceKBFile) string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("%s\n\n", doc.Content.Title))
	for _, term := range doc.Content.Terms {
		sb.WriteString(fmt.Sprintf("Payment Method: %s\n", term.Name))
		sb.WriteString(fmt.Sprintf("  Risk Level: %s (Score: %d/100)\n", term.RiskLevel, term.RiskScore))
		sb.WriteString(fmt.Sprintf("  Description: %s\n", term.Description))
		sb.WriteString(fmt.Sprintf("  Best For: %s\n", term.BestFor))
		sb.WriteString(fmt.Sprintf("  Drawbacks: %s\n\n", term.Drawbacks))
	}
	r := doc.Content.Recommendations
	sb.WriteString("Recommendations:\n")
	if r.NewBuyer != "" {
		sb.WriteString(fmt.Sprintf("  New buyer: %s\n", r.NewBuyer))
	}
	if r.EstablishedBuyer != "" {
		sb.WriteString(fmt.Sprintf("  Established buyer: %s\n", r.EstablishedBuyer))
	}
	if r.HighRiskCountry != "" {
		sb.WriteString(fmt.Sprintf("  High-risk country: %s\n", r.HighRiskCountry))
	}
	if r.ExportInsurance != "" {
		sb.WriteString(fmt.Sprintf("  Export insurance: %s\n", r.ExportInsurance))
	}
	return strings.TrimRight(sb.String(), "\n")
}

// ── Parser ───────────────────────────────────────────────────────────────────

func parseDocument(path string, content []byte) Document {
	ext := filepath.Ext(path)
	if ext == ".json" {
		// Try country profile format first
		var countryDoc countryKBFile
		if err := json.Unmarshal(content, &countryDoc); err == nil && countryDoc.Content.Country != "" {
			return Document{
				Title:   countryDoc.Title,
				Source:  countryDoc.Source,
				Content: flattenCountryDoc(countryDoc),
			}
		}
		// Try trade-finance format
		var tfDoc tradeFinanceKBFile
		if err := json.Unmarshal(content, &tfDoc); err == nil && len(tfDoc.Content.Terms) > 0 {
			return Document{
				Title:   tfDoc.Title,
				Source:  tfDoc.Source,
				Content: flattenTradeFinanceDoc(tfDoc),
			}
		}
		// Generic JSON fallback: use raw content (still better than nothing)
		var generic struct {
			Title  string `json:"title"`
			Source string `json:"source"`
		}
		if err := json.Unmarshal(content, &generic); err == nil {
			return Document{
				Title:   generic.Title,
				Source:  generic.Source,
				Content: string(content),
			}
		}
	}

	// Markdown parsing
	title := filepath.Base(path)
	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "# ") {
			title = strings.TrimPrefix(strings.TrimSpace(line), "# ")
			break
		}
	}
	return Document{
		Title:   title,
		Source:  "Curated Export Reference Library",
		Content: string(content),
	}
}

func hasWord(text, word string) bool {
	idx := strings.Index(text, word)
	if idx == -1 {
		return false
	}
	for idx != -1 {
		startOK := idx == 0 || !isAlphaNum(text[idx-1])
		endOK := idx+len(word) == len(text) || !isAlphaNum(text[idx+len(word)])
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

func isAlphaNum(c byte) bool {
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')
}
