package company

import (
	"context"
	"time"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/validator"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Apply(ctx context.Context, req ApplyRequest) (*ApplyResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}

	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	existing, _ := s.repo.GetByApplicantUserID(ctx, u.ID)
	if existing != nil {
		if existing.Status == StatusApproved {
			return nil, apperror.New("CONFLICT", "application already approved", 409)
		}
		// If application is pending or rejected, allow resubmission
		existing.CompanyName = req.CompanyName
		existing.BusinessSector = req.BusinessSector
		existing.Country = req.Country
		existing.Status = StatusPending
		existing.RevisionNotes = ""
		existing.RejectReason = ""
		existing.UpdatedAt = time.Now().UTC()
		if err := s.repo.Update(ctx, existing); err != nil {
			return nil, err
		}
		resp := ToApplyResponse(existing)
		return &resp, nil
	}

	c := &Company{
		ApplicantUserID: u.ID,
		CompanyName:     req.CompanyName,
		BusinessSector:  req.BusinessSector,
		Country:         req.Country,
		Status:          StatusPending,
		SubmittedAt:     time.Now().UTC(),
		UpdatedAt:       time.Now().UTC(),
	}
	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	resp := ToApplyResponse(c)
	return &resp, nil
}

func (s *Service) GetApplicationStatus(ctx context.Context) (*ApplicationStatusResponse, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	c, err := s.repo.GetByApplicantUserID(ctx, u.ID)
	if err != nil {
		if u.CompanyID != "" {
			c, err = s.repo.GetByID(ctx, u.CompanyID)
		}
	}
	if err != nil {
		resp := ToStatusResponse(nil)
		return &resp, nil
	}
	resp := ToStatusResponse(c)
	return &resp, nil
}

func (s *Service) GetByID(ctx context.Context, id string) (*Company, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) GetCompanyDetail(ctx context.Context, id string) (*CompanyDetailResponse, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}

	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if u.Role != "admin" && u.CompanyID != id && c.ApplicantUserID != u.ID {
		return nil, apperror.ErrForbidden
	}

	resp := ToCompanyDetailResponse(c)
	return &resp, nil
}

func (s *Service) RequestChange(ctx context.Context, companyID string) error {
	c, err := s.repo.GetByID(ctx, companyID)
	if err != nil {
		return err
	}
	c.Status = StatusPending
	c.UpdatedAt = time.Now().UTC()
	return s.repo.Update(ctx, c)
}
