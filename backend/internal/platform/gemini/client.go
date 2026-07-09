package gemini

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

var availableModels = []string{
	"gemini-2.0-flash",
	"gemini-2.5-flash",
	"gemini-3.5-flash",
	"gemini-flash-latest",
}

type Client struct {
	apiKey     string
	httpClient *http.Client
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:     apiKey,
		httpClient: &http.Client{},
	}
}

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

func (c *Client) Generate(ctx context.Context, prompt string) (string, error) {
	if c.apiKey == "" || c.apiKey == "your-gemini-api-key" {
		return "", fmt.Errorf("gemini API key is missing or invalid; set GEMINI_API_KEY in backend/.env or the environment")
	}

	bodyData, err := json.Marshal(GenerateRequest{
		Contents: []Content{{Parts: []Part{{Text: prompt}}}},
		GenerationConfig: &GenerationConfig{
			Temperature:     0.55,
			CandidateCount:  1,
			MaxOutputTokens: 8192,
		},
	})
	if err != nil {
		return "", err
	}

	var lastErr error
	for _, modelName := range availableModels {
		reqURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, c.apiKey)

		// Create request
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL, bytes.NewReader(bodyData))
		if err != nil {
			lastErr = err
			continue
		}
		req.Header.Set("Content-Type", "application/json")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		respBody, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			continue
		}

		if resp.StatusCode == http.StatusTooManyRequests {
			// Save error and try the next model
			lastErr = fmt.Errorf("gemini API error (model: %s, code: 429): %s", modelName, string(respBody))
			continue
		}

		if resp.StatusCode >= 400 {
			lastErr = fmt.Errorf("gemini API error (model: %s, code: %d): %s", modelName, resp.StatusCode, string(respBody))
			continue
		}

		var result GenerateResponse
		if err := json.Unmarshal(respBody, &result); err != nil {
			lastErr = err
			continue
		}

		if len(result.Candidates) == 0 || len(result.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("empty gemini response (model: %s)", modelName)
			continue
		}

		return result.Candidates[0].Content.Parts[0].Text, nil
	}

	return "", fmt.Errorf("all models failed. Last error: %w", lastErr)
}
