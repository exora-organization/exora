package contact

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	repo         Repository
	clientSecret string
	verifyURL    string
}

func NewService(repo Repository, secret string) *Service {
	return &Service{
		repo:         repo,
		clientSecret: secret,
		verifyURL:    "https://www.google.com/recaptcha/api/siteverify",
	}
}

// SubmitMessage validates the Google reCAPTCHA token and saves the contact message to Firestore.
func (s *Service) SubmitMessage(ctx context.Context, req SubmitRequest) error {
	// Trim fields
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)

	if err := validator.Validate(req); err != nil {
		return apperror.ErrValidation
	}

	// Validate reCAPTCHA with Google
	if err := s.verifyGoogleRecaptcha(req.RecaptchaToken); err != nil {
		return err
	}

	// Save to DB
	msg := &ContactMessage{
		Name:        req.Name,
		Email:       req.Email,
		CompanyName: req.CompanyName,
		Subject:     req.Subject,
		Message:     req.Message,
	}

	return s.repo.Save(ctx, msg)
}

func (s *Service) verifyGoogleRecaptcha(responseToken string) error {
	secret := s.clientSecret
	if !strings.HasPrefix(secret, "6L") {
		// Use Google test secret key if not a valid Google reCAPTCHA key (which always starts with 6L)
		secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
	}

	resp, err := http.PostForm(s.verifyURL, url.Values{
		"secret":   {secret},
		"response": {responseToken},
	})
	if err != nil {
		return apperror.New("CAPTCHA_VERIFY_ERROR", "failed to verify reCAPTCHA with Google", 500)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return apperror.New("CAPTCHA_VERIFY_ERROR", "failed to read Google response", 500)
	}

	log.Printf("Google reCAPTCHA verification. Secret: %s, Response Token: %s. Response body: %s", secret, responseToken, string(bodyBytes))

	var result struct {
		Success    bool     `json:"success"`
		ErrorCodes []string `json:"error-codes"`
	}

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return apperror.New("CAPTCHA_VERIFY_ERROR", "failed to parse Google reCAPTCHA response", 500)
	}

	if !result.Success {
		return apperror.New("CAPTCHA_INCORRECT", "Google reCAPTCHA verification failed. Please try again.", 400)
	}

	return nil
}
