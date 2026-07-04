package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                    string
	Environment             string
	FirebaseCredentialsPath string
	FirestoreProjectID      string
	GeminiAPIKey            string
	InvitationTTL           time.Duration
	CORSAllowedOrigins      []string
	AppBaseURL              string
	TurnstileSecretKey      string
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	invitationTTLHours, err := strconv.Atoi(getEnv("INVITATION_TTL_HOURS", "168"))
	if err != nil {
		return nil, fmt.Errorf("invalid INVITATION_TTL_HOURS: %w", err)
	}

	return &Config{
		Port:                    getEnv("PORT", "8080"),
		Environment:             getEnv("ENVIRONMENT", "development"),
		FirebaseCredentialsPath: getEnv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json"),
		FirestoreProjectID:      getEnv("FIRESTORE_PROJECT_ID", ""),
		GeminiAPIKey:            getEnv("GEMINI_API_KEY", ""),
		InvitationTTL:           time.Duration(invitationTTLHours) * time.Hour,
		CORSAllowedOrigins:      splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		AppBaseURL:              getEnv("APP_BASE_URL", "https://app.exora.app"),
		TurnstileSecretKey:      getEnv("TURNSTILE_SECRET_KEY", ""),
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := make([]string, 0)
	for _, p := range splitString(s, ',') {
		if trimmed := trimSpace(p); trimmed != "" {
			parts = append(parts, trimmed)
		}
	}
	return parts
}

func splitString(s string, sep rune) []string {
	var parts []string
	start := 0
	for i, r := range s {
		if r == sep {
			parts = append(parts, s[start:i])
			start = i + 1
		}
	}
	parts = append(parts, s[start:])
	return parts
}

func trimSpace(s string) string {
	i, j := 0, len(s)
	for i < j && (s[i] == ' ' || s[i] == '\t') {
		i++
	}
	for j > i && (s[j-1] == ' ' || s[j-1] == '\t') {
		j--
	}
	return s[i:j]
}
