package auth

import (
	"context"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	users     user.Repository
	companies company.Repository
}

func NewService(users user.Repository, companies company.Repository) *Service {
	return &Service{users: users, companies: companies}
}

func (s *Service) Register(ctx context.Context, req user.RegisterRequest) (*user.SessionProfile, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.WithDetails("VALIDATION_ERROR", "invalid request", 400, []apperror.ErrorDetail{
			{Field: "displayName", Issue: err.Error()},
		})
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
