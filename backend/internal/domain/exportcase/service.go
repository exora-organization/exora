package exportcase

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

// Create performs validation and creates a new export case in draft status, linked to the user's company tenant.
func (s *Service) Create(ctx context.Context, req CreateRequest) (*CaseResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, apperror.ErrUnauthenticated
	}
	if u.CompanyID == "" && u.Role != "admin" {
		return nil, apperror.ErrForbidden
	}

	companyID := u.CompanyID
	c := &ExportCase{
		CompanyID:          companyID,
		Name:               req.Name,
		Product:            req.Product,
		DestinationCountry: req.DestinationCountry,
		Status:             StatusDraft,
		CreatedBy:          u.ID,
		AssignedTo:         u.ID,
	}
	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	resp := toCaseResponse(c)
	return &resp, nil
}

// List returns a paginated slice of cases belonging to the user's company (or filtered by companyId if requester is admin).
func (s *Service) List(ctx context.Context, companyIDFilter string, limit int, cursor string) ([]ListItem, *string, error) {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return nil, nil, apperror.ErrUnauthenticated
	}

	companyID := u.CompanyID
	if u.Role == "admin" && companyIDFilter != "" {
		companyID = companyIDFilter
	}

	cases, next, err := s.repo.ListByCompany(ctx, companyID, limit, cursor)
	if err != nil {
		return nil, nil, err
	}

	items := make([]ListItem, 0, len(cases))
	for _, c := range cases {
		// All authorized roles can see all cases in the company
		items = append(items, ListItem{
			CaseID:             c.ID,
			CompanyID:          c.CompanyID,
			Name:               c.Name,
			DestinationCountry: c.DestinationCountry,
			Status:             c.Status,
			FeasibilityScore:   c.FeasibilityScore,
			CreatedAt:          c.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return items, next, nil
}

func (s *Service) GetByID(ctx context.Context, caseID string) (*ExportCase, error) {
	c, err := s.repo.GetByID(ctx, caseID)
	if err != nil {
		return nil, err
	}
	if err := s.ensureAccess(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) GetDetail(ctx context.Context, caseID string) (*CaseResponse, error) {
	c, err := s.GetByID(ctx, caseID)
	if err != nil {
		return nil, err
	}
	resp := toCaseResponse(c)
	return &resp, nil
}

func (s *Service) Update(ctx context.Context, caseID string, req UpdateRequest) (*CaseResponse, error) {
	if err := validator.Validate(req); err != nil {
		return nil, apperror.ErrValidation
	}
	c, err := s.GetByID(ctx, caseID)
	if err != nil {
		return nil, err
	}
	if req.Name != nil {
		c.Name = *req.Name
	}
	if req.Product != nil {
		c.Product = *req.Product
	}
	if req.DestinationCountry != nil {
		c.DestinationCountry = *req.DestinationCountry
	}
	if req.Status != nil {
		c.Status = *req.Status
	}
	if req.FeasibilityScore != nil {
		c.FeasibilityScore = req.FeasibilityScore
	}
	if err := s.repo.Update(ctx, c); err != nil {
		return nil, err
	}
	resp := toCaseResponse(c)
	return &resp, nil
}

func (s *Service) Delete(ctx context.Context, caseID string) error {
	c, err := s.GetByID(ctx, caseID)
	if err != nil {
		return err
	}
	return s.repo.Delete(ctx, c.ID)
}

func (s *Service) ensureAccess(ctx context.Context, c *ExportCase) error {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return apperror.ErrUnauthenticated
	}
	if u.Role == "admin" {
		return nil
	}
	if c.CompanyID != u.CompanyID {
		return apperror.ErrForbidden
	}
	return nil
}

func toCaseResponse(c *ExportCase) CaseResponse {
	return CaseResponse{
		CaseID:             c.ID,
		CompanyID:          c.CompanyID,
		Name:               c.Name,
		Product:            c.Product,
		DestinationCountry: c.DestinationCountry,
		Status:             c.Status,
		FeasibilityScore:   c.FeasibilityScore,
		CreatedBy:          c.CreatedBy,
		CreatedAt:          c.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:          c.UpdatedAt.UTC().Format(time.RFC3339),
	}
}
