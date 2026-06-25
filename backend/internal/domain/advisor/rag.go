package advisor

import (
	"os"
	"path/filepath"
	"strings"
)

type KnowledgeBase struct {
	root string
}

func NewKnowledgeBase(root string) *KnowledgeBase {
	return &KnowledgeBase{root: root}
}

func (kb *KnowledgeBase) Search(query string, maxResults int) ([]string, error) {
	if maxResults <= 0 {
		maxResults = 3
	}

	query = strings.ToLower(query)
	var matches []string

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
			if strings.Contains(strings.ToLower(text), query) || strings.Contains(strings.ToLower(e.Name()), query) {
				matches = append(matches, text)
				if len(matches) >= maxResults {
					return matches, nil
				}
			}
		}
	}
	return matches, nil
}

func (kb *KnowledgeBase) BuildContext(snippets []string) string {
	return strings.Join(snippets, "\n---\n")
}
