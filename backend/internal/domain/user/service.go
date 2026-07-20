package user

import (
	"context"
	"fmt"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/platform/firebaseauth"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	repo         Repository
	companies    company.Repository
	firebaseAuth *firebaseauth.Client
	appBaseURL   string
}

func NewService(repo Repository, companies company.Repository, firebaseAuth *firebaseauth.Client, appBaseURL string) *Service {
	return &Service{repo: repo, companies: companies, firebaseAuth: firebaseAuth, appBaseURL: appBaseURL}
}

func (s *Service) Me(ctx context.Context) (*SessionProfile, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}
	full, err := s.repo.GetByID(ctx, u.ID)
	if err != nil {
		return nil, err
	}
	return ResolveCompanyStatus(ctx, full, s.companies)
}

func (s *Service) List(ctx context.Context, companyIDFilter string) ([]UserResponse, error) {
	actorUser, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	var users []*User
	var err error
	if actorUser.Role == RoleAdmin {
		users, err = s.repo.ListAll(ctx, companyIDFilter)
	} else if actorUser.Role == RoleCompanyOwner {
		users, err = s.repo.ListByCompany(ctx, actorUser.CompanyID)
	} else {
		return nil, apperror.ErrForbidden
	}
	if err != nil {
		return nil, err
	}

	resp := make([]UserResponse, len(users))
	for i, u := range users {
		resp[i] = ToUserResponse(u)
	}
	return resp, nil
}

func (s *Service) Update(ctx context.Context, userID string, req UpdateUserRequest) (*UserResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	if err := s.ensureTenantAccess(ctx, userID); err != nil {
		return nil, err
	}

	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if req.DisplayName != nil {
		u.DisplayName = *req.DisplayName
	}
	if req.Status != nil {
		u.Status = *req.Status
	}
	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}
	resp := ToUserResponse(u)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, userID string) (map[string]any, error) {
	if err := s.ensureTenantAccess(ctx, userID); err != nil {
		return nil, err
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if s.firebaseAuth != nil && u.FirebaseUID != "" {
		_ = s.firebaseAuth.DeleteUser(ctx, u.FirebaseUID)
	}
	if err := s.repo.Delete(ctx, userID); err != nil {
		return nil, err
	}
	return map[string]any{"userId": userID, "deleted": true}, nil
}

func (s *Service) ChangeRole(ctx context.Context, userID string, req ChangeRoleRequest) (*UserResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	if err := s.ensureTenantAccess(ctx, userID); err != nil {
		return nil, err
	}

	actorUser, _ := actor.FromContext(ctx)
	target, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if actorUser.Role == RoleCompanyOwner {
		if req.Role != RoleExportManager && req.Role != RoleFinanceStaff {
			return nil, apperror.ErrForbidden
		}
		if target.CompanyID != actorUser.CompanyID {
			return nil, apperror.ErrForbidden
		}
	}

	target.Role = req.Role
	if err := s.repo.Update(ctx, target); err != nil {
		return nil, err
	}
	resp := ToUserResponse(target)
	return &resp, nil
}

func (s *Service) ensureTenantAccess(ctx context.Context, targetUserID string) error {
	actorUser, ok := actor.FromContext(ctx)
	if !ok {
		return apperror.ErrUnauthenticated
	}
	if actorUser.Role == RoleAdmin {
		return nil
	}
	target, err := s.repo.GetByID(ctx, targetUserID)
	if err != nil {
		return err
	}
	if target.CompanyID != actorUser.CompanyID {
		return apperror.ErrForbidden
	}
	return nil
}

func (s *Service) GetByID(ctx context.Context, id string) (*User, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) GetUserByID(ctx context.Context, userID string) (*UserResponse, error) {
	if err := s.ensureTenantAccess(ctx, userID); err != nil {
		return nil, err
	}
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	resp := ToUserResponse(u)
	return &resp, nil
}

// Invite delegates to invitation service — kept on user handler route POST /users/invite
func (s *Service) InviteURL(token string) string {
	return fmt.Sprintf("%s/invite/%s", s.appBaseURL, token)
}
