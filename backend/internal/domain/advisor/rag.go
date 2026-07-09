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

func parseDocument(path string, content []byte) Document {
	ext := filepath.Ext(path)
	if ext == ".json" {
		var doc struct {
			Title  string `json:"title"`
			Source string `json:"source"`
		}
		if err := json.Unmarshal(content, &doc); err == nil {
			return Document{
				Title:   doc.Title,
				Source:  doc.Source,
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
