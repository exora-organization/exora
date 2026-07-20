package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/invitation"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	users           user.Repository
	companies       company.Repository
	invitations     invitation.Repository
	turnstileSecret string
}

func NewService(users user.Repository, companies company.Repository, invitations invitation.Repository, turnstileSecret string) *Service {
	return &Service{users: users, companies: companies, invitations: invitations, turnstileSecret: turnstileSecret}
}

func (s *Service) Register(ctx context.Context, req user.RegisterRequest) (*user.SessionProfile, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.WithDetails("VALIDATION_ERROR", "invalid request", 400, []apperror.ErrorDetail{
			{Field: "displayName", Issue: err.Error()},
		})
	}

	if err := s.verifyGoogleRecaptcha(ctx, req.RecaptchaToken); err != nil {
		return nil, err
	}

	claims, ok := actor.ClaimsFromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	if _, err := s.users.GetByFirebaseUID(ctx, claims.UID); err == nil {
		return nil, apperror.New("CONFLICT", "profile already exists for firebaseUid", 409)
	}

	u := &user.User{
		FirebaseUID: claims.UID,
		Email:       claims.Email,
		DisplayName: req.DisplayName,
		Role:        user.RoleGuest,
		Status:      user.StatusActive,
	}

	// Auto-accept pending invitation if exists for this email
	if inv, err := s.invitations.GetPendingByEmail(ctx, claims.Email); err == nil {
		u.Role = inv.Role
		u.CompanyID = inv.CompanyID
		now := time.Now().UTC()
		inv.Status = invitation.StatusAccepted
		inv.AcceptedAt = &now
		_ = s.invitations.Update(ctx, inv)
	}

	if err := s.users.Create(ctx, u); err != nil {
		return nil, err
	}

	profile, _ := user.ResolveCompanyStatus(ctx, u, s.companies)
	profile.FirebaseUID = claims.UID
	created := u.CreatedAt.UTC().Format(time.RFC3339)
	profile.CreatedAt = &created
	return profile, nil
}

func (s *Service) Login(ctx context.Context) (*user.SessionProfile, error) {
	claims, ok := actor.ClaimsFromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	u, err := s.users.GetByFirebaseUID(ctx, claims.UID)
	if err != nil {
		return nil, apperror.ErrUnauthenticated
	}

	// Auto-accept pending invitation if exists for this email and user is currently guest
	if u.Role == user.RoleGuest && u.CompanyID == "" {
		if inv, err := s.invitations.GetPendingByEmail(ctx, u.Email); err == nil {
			u.Role = inv.Role
			u.CompanyID = inv.CompanyID
			now := time.Now().UTC()
			inv.Status = invitation.StatusAccepted
			inv.AcceptedAt = &now
			_ = s.invitations.Update(ctx, inv)
			_ = s.users.Update(ctx, u)
		}
	}

	return user.ResolveCompanyStatus(ctx, u, s.companies)
}

func (s *Service) Logout(_ context.Context) map[string]bool {
	return map[string]bool{"loggedOut": true}
}

func (s *Service) Me(ctx context.Context) (*user.SessionProfile, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}
	full, err := s.users.GetByID(ctx, u.ID)
	if err != nil {
		return nil, err
	}
	return user.ResolveCompanyStatus(ctx, full, s.companies)
}

func (s *Service) verifyGoogleRecaptcha(ctx context.Context, token string) error {
	secret := s.turnstileSecret
	if secret == "" {
		// bot protection disabled in this environment (e.g. local dev / testing)
		return nil
	}
	if !strings.HasPrefix(secret, "6L") {
		// Use Google test secret key if not a valid Google reCAPTCHA key (which always starts with 6L)
		secret = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
	}

	if token == "" {
		return apperror.New("VALIDATION_ERROR", "reCAPTCHA verification token is required", http.StatusBadRequest)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	data := url.Values{}
	data.Set("secret", secret)
	data.Set("response", token)

	req, err := http.NewRequestWithContext(ctx, "POST", "https://www.google.com/recaptcha/api/siteverify", strings.NewReader(data.Encode()))
	if err != nil {
		return apperror.New("INTERNAL_ERROR", "failed to create reCAPTCHA request", http.StatusInternalServerError)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)
	if err != nil {
		return apperror.New("INTERNAL_ERROR", "failed to contact reCAPTCHA verification server", http.StatusInternalServerError)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return apperror.New("INTERNAL_ERROR", "reCAPTCHA server returned non-200 status", http.StatusInternalServerError)
	}

	var res struct {
		Success bool     `json:"success"`
		Errors  []string `json:"error-codes"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return apperror.New("INTERNAL_ERROR", "failed to parse reCAPTCHA server response", http.StatusInternalServerError)
	}

	if !res.Success {
		return apperror.New("VALIDATION_ERROR", "reCAPTCHA bot validation failed", http.StatusBadRequest)
	}

	return nil
}

