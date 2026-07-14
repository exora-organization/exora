//go:build ignore

package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type GenerateRequest struct {
	Contents         []Content         `json:"contents"`
	GenerationConfig *GenerationConfig `json:"generationConfig,omitempty"`
}

type GenerationConfig struct {
	Temperature     float64 `json:"temperature,omitempty"`
	CandidateCount  int     `json:"candidateCount,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type Content struct {
	Parts []Part `json:"parts"`
}

type Part struct {
	Text string `json:"text"`
}

type GenerateResponse struct {
	Candidates []struct {
		Content Content `json:"content"`
	} `json:"candidates"`
}

func main() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		apiKey = "AQ.Ab8RN6J_XJDUGItTXKSjA2kyCraHIdhOrxppAgBJxiYwKuowcw"
	}

	prompt := `You are EXORA, an expert export trade decision advisor for Indonesian SMEs.
Analyze the following company-wide export profile and provide actionable company-wide strategic recommendations.

=== COMPANY EXPORT PROFILE CONTEXT ===
Company Profile Summary: Total Cases = 1
Case 1: Name=Arabica Coffee to Tokyo Port, Product=Java Specialty Preanger Arabica Coffee Beans, Destination=Japan, Status=in_review
  Costing: HPP=1150000, Packaging=50000, Transport=200000, Freight=400000, PaymentTerm=T/T
  Pricing: Incoterm=CIF, SellingPriceUSD=145.77, ActualMargin=16.7%

=== KNOWLEDGE BASE ===


=== QUESTION / FOCUS AREA ===
compare with bisnis risk malaysia

When answering, do not reuse a fixed template. Be specific to the company's data and avoid generic recommendations.
Only use the provided case and knowledge base context.

Provide a focused, structured response covering:
1. Strategic priorities and feasibility across the company's export cases
2. Major risks, mitigations, and cashflow / payment recommendations
3. Next steps to strengthen execution or expand export activity
4. Pricing, incoterm, and cost optimization advice relevant to the existing cases

Keep the response practical, concrete, and directly tied to the provided data.`

	bodyData, _ := json.Marshal(GenerateRequest{
		Contents: []Content{{Parts: []Part{{Text: prompt}}}},
		GenerationConfig: &GenerationConfig{
			Temperature:     0.55,
			CandidateCount:  1,
			MaxOutputTokens: 8192,
		},
	})

	// Use gemini-2.5-flash since 2.0-flash is 429 rate limited
	modelName := "gemini-2.5-flash"
	reqURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey)

	req, _ := http.NewRequestWithContext(context.Background(), http.MethodPost, reqURL, bytes.NewReader(bodyData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}

