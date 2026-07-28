package invitation

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	repo       Repository
	users      user.Repository
	companies  company.Repository
	ttl        time.Duration
	appBaseURL string
}

func NewService(repo Repository, users user.Repository, companies company.Repository, ttl time.Duration, appBaseURL string) *Service {
	return &Service{repo: repo, users: users, companies: companies, ttl: ttl, appBaseURL: appBaseURL}
}

func (s *Service) Invite(ctx context.Context, req user.InviteRequest) (*InviteResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	return s.createInvitation(ctx, req.Email, req.Role)
}

func (s *Service) createInvitation(ctx context.Context, email, role string) (*InviteResponse, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	email = strings.ToLower(strings.TrimSpace(email))

	// Prevent inviting a user who is already registered as an active member of any company
	if existing, err := s.users.GetByEmail(ctx, email); err == nil && existing.Status != user.StatusDeleted {
		if existing.CompanyID == u.CompanyID {
			return nil, apperror.New("CONFLICT", "This email is already registered as a team member in your company.", 409)
		}
		if existing.CompanyID != "" {
			return nil, apperror.New("CONFLICT", "This user is already registered under another company. They must be removed from their current company first.", 409)
		}
		if existing.Role == user.RoleAdmin {
			return nil, apperror.New("CONFLICT", "System Administrator accounts cannot be invited to a company team.", 409)
		}
	}

	// BUG-019: Prevent duplicate pending invitations for the same email
	if _, err := s.repo.GetPendingByEmailAndCompany(ctx, email, u.CompanyID); err == nil {
		return nil, apperror.New("CONFLICT", "A pending invitation already exists for this email address.", 409)
	}

	token, err := generateToken()
	if err != nil {
		return nil, err
	}

	inv := &Invitation{
		CompanyID: u.CompanyID,
		Email:     email,
		Role:      role,
		Token:     token,
		Status:    StatusPending,
		InvitedBy: u.ID,
		ExpiresAt: time.Now().UTC().Add(s.ttl),
	}
	if err := s.repo.Create(ctx, inv); err != nil {
		return nil, err
	}
	return toInviteResponse(inv, s.appBaseURL), nil
}

func (s *Service) List(ctx context.Context) ([]ListItem, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}
	invs, err := s.repo.ListPendingByCompany(ctx, u.CompanyID)
	if err != nil {
		return nil, err
	}
	items := make([]ListItem, len(invs))
	for i, inv := range invs {
		items[i] = ListItem{
			InvitationID: inv.ID,
			Email:        inv.Email,
			Role:         inv.Role,
			Status:       inv.Status,
			ExpiresAt:    inv.ExpiresAt.UTC().Format(time.RFC3339),
		}
	}
	return items, nil
}

func (s *Service) Preview(ctx context.Context, token string) (*PreviewResponse, error) {
	inv, err := s.loadValidInvitation(ctx, token)
	if err != nil {
		return nil, err
	}
	co, _ := s.companies.GetByID(ctx, inv.CompanyID)
	name := ""
	if co != nil {
		name = co.CompanyName
	}
	return &PreviewResponse{
		Email:       inv.Email,
		Role:        inv.Role,
		CompanyName: name,
		Status:      inv.Status,
		ExpiresAt:   inv.ExpiresAt.UTC().Format(time.RFC3339),
	}, nil
}

func (s *Service) Accept(ctx context.Context, token string) (*AcceptResponse, error) {
	inv, err := s.loadValidInvitation(ctx, token)
	if err != nil {
		return nil, err
	}

	claims, ok := actor.ClaimsFromContext(ctx)
	if !ok {
		u, ok := actor.FromContext(ctx)
		if !ok {
			return nil, apperror.ErrUnauthenticated
		}
		claims = &actor.FirebaseClaims{UID: u.FirebaseUID, Email: u.Email}
	}

	userEmail := strings.ToLower(strings.TrimSpace(claims.Email))
	if userEmail == "" {
		if u, ok := actor.FromContext(ctx); ok {
			userEmail = strings.ToLower(strings.TrimSpace(u.Email))
		}
	}
	targetEmail := strings.ToLower(strings.TrimSpace(inv.Email))

	if userEmail != targetEmail {
		return nil, apperror.New("FORBIDDEN", fmt.Sprintf("This invitation was sent to %s, but you are currently logged in as %s. Please log in with the invited email address.", inv.Email, claims.Email), 403)
	}

	now := time.Now().UTC()
	inv.Status = StatusAccepted
	inv.AcceptedAt = &now
	if err := s.repo.Update(ctx, inv); err != nil {
		return nil, err
	}

	existing, err := s.users.GetByFirebaseUID(ctx, claims.UID)
	if err != nil {
		u := &user.User{
			FirebaseUID: claims.UID,
			Email:       inv.Email,
			DisplayName: inv.Email,
			Role:        inv.Role,
			CompanyID:   inv.CompanyID,
			Status:      user.StatusActive,
		}
		if err := s.users.Create(ctx, u); err != nil {
			return nil, err
		}
		return &AcceptResponse{
			UserID:           u.ID,
			Role:             u.Role,
			CompanyID:        u.CompanyID,
			InvitationStatus: StatusAccepted,
		}, nil
	}

	// Prevent any user who already belongs to another company from accepting this invitation
	if existing.CompanyID != "" && existing.CompanyID != inv.CompanyID {
		if existing.Role == user.RoleCompanyOwner {
			return nil, apperror.New("CONFLICT", "As a Company Owner, you cannot join another company before transferring your ownership.", 409)
		}
		return nil, apperror.New("CONFLICT", "You are already registered as a team member under another company. Please contact your company administrator before joining.", 409)
	}

	if existing.Role == user.RoleAdmin {
		return nil, apperror.New("CONFLICT", "System Administrator accounts cannot join a company team.", 409)
	}

	existing.Role = inv.Role
	existing.CompanyID = inv.CompanyID
	if err := s.users.Update(ctx, existing); err != nil {
		return nil, err
	}
	return &AcceptResponse{
		UserID:           existing.ID,
		Role:             existing.Role,
		CompanyID:        existing.CompanyID,
		InvitationStatus: StatusAccepted,
	}, nil
}

func (s *Service) Resend(ctx context.Context, req ResendRequest) (*InviteResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	inv, err := s.repo.GetByID(ctx, req.InvitationID)
	if err != nil {
		return nil, err
	}
	if inv.CompanyID != u.CompanyID {
		return nil, apperror.ErrForbidden
	}

	token, err := generateToken()
	if err != nil {
		return nil, err
	}
	inv.Token = token
	inv.Status = StatusPending
	inv.ExpiresAt = time.Now().UTC().Add(s.ttl)
	if err := s.repo.Update(ctx, inv); err != nil {
		return nil, err
	}
	return toInviteResponse(inv, s.appBaseURL), nil
}

func (s *Service) Delete(ctx context.Context, invitationID string) error {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return apperror.ErrUnauthenticated
	}

	inv, err := s.repo.GetByID(ctx, invitationID)
	if err != nil {
		return err
	}

	if inv.CompanyID != u.CompanyID {
		return apperror.ErrForbidden
	}

	return s.repo.Delete(ctx, invitationID)
}

func (s *Service) loadValidInvitation(ctx context.Context, token string) (*Invitation, error) {
	inv, err := s.repo.GetByToken(ctx, token)
	if err != nil {
		return nil, apperror.ErrNotFound
	}
	if inv.Status != StatusPending {
		return nil, apperror.New("EXPIRED", "invitation is no longer pending", 410)
	}
	if time.Now().UTC().After(inv.ExpiresAt) {
		return nil, apperror.New("EXPIRED", "invitation expired", 410)
	}
	return inv, nil
}

func toInviteResponse(inv *Invitation, baseURL string) *InviteResponse {
	return &InviteResponse{
		InvitationID: inv.ID,
		Email:        inv.Email,
		Role:         inv.Role,
		CompanyID:    inv.CompanyID,
		Token:        inv.Token,
		InviteURL:    fmt.Sprintf("%s/invite/%s", baseURL, inv.Token),
		Status:       inv.Status,
		ExpiresAt:    inv.ExpiresAt.UTC().Format(time.RFC3339),
		CreatedAt:    inv.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func generateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
