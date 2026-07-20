package apperror

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorDetail struct {
	Field string `json:"field"`
	Issue string `json:"issue"`
}

type AppError struct {
	Code       string        `json:"code"`
	Message    string        `json:"message"`
	Details    []ErrorDetail `json:"details,omitempty"`
	HTTPStatus int           `json:"-"`
}

func (e *AppError) Error() string {
	return e.Message
}

func New(code, message string, status int) *AppError {
	return &AppError{Code: code, Message: message, HTTPStatus: status}
}

func WithDetails(code, message string, status int, details []ErrorDetail) *AppError {
	return &AppError{Code: code, Message: message, HTTPStatus: status, Details: details}
}

var (
	ErrAccountDisabled  = New("ACCOUNT_DISABLED", "your account has been deleted or is no longer active. Please contact support.", http.StatusForbidden)
	ErrUnauthenticated  = New("UNAUTHENTICATED", "authentication required", http.StatusUnauthorized)
	ErrForbidden        = New("FORBIDDEN", "insufficient permissions", http.StatusForbidden)
	ErrEmailNotVerified = New("EMAIL_NOT_VERIFIED", "email verification is required. Please verify your email address to access this feature.", http.StatusForbidden)
	ErrNotFound         = New("NOT_FOUND", "resource not found", http.StatusNotFound)
	ErrValidation       = New("VALIDATION_ERROR", "invalid request", http.StatusBadRequest)
	ErrConflict         = New("CONFLICT", "resource conflict", http.StatusConflict)
	ErrUnprocessable    = New("UNPROCESSABLE", "business rule violation", http.StatusUnprocessableEntity)
	ErrRateLimited      = New("RATE_LIMITED", "rate limit exceeded", http.StatusTooManyRequests)
	ErrInternal         = New("INTERNAL_ERROR", "internal server error", http.StatusInternalServerError)
	ErrAITimeout        = New("AI_TIMEOUT", "AI service timeout", http.StatusGatewayTimeout)
	ErrExpired          = New("EXPIRED", "resource expired", http.StatusGone)
)

func Write(w http.ResponseWriter, err error) {
	var appErr *AppError
	if e, ok := err.(*AppError); ok {
		appErr = e
	} else {
		appErr = ErrInternal
		// Log the underlying error for debugging
		log.Printf("Internal Error: %v\n", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(appErr.HTTPStatus)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": false,
		"error": map[string]any{
			"code":    appErr.Code,
			"message": appErr.Message,
			"details": appErr.Details,
		},
	})
}
