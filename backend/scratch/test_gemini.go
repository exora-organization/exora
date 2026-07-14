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

	prompt := "Compare the logistics risk between Korea and Singapore for export"
	bodyData, _ := json.Marshal(GenerateRequest{
		Contents: []Content{{Parts: []Part{{Text: prompt}}}},
		GenerationConfig: &GenerationConfig{
			Temperature:     0.55,
			CandidateCount:  1,
			MaxOutputTokens: 900,
		},
	})

	modelName := "gemini-2.0-flash"
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
	fmt.Printf("Status: %d\n", resp.StatusCode)
	fmt.Printf("Raw Response:\n%s\n", string(respBody))
}

