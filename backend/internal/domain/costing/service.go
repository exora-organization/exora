package costing

import (
	"context"
	"strings"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/apperror"
	"github.com/exora/backend/pkg/validator"
)

// Service handles cost data business logic (SRS FR-010).
// Calculation is pure; persistence is delegated to Repository.
type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// SaveCostData validates, applies business-rule warnings, and persists cost data.
// RULE-027: Warnings do NOT block saving; response includes a warnings array.
func (s *Service) SaveCostData(ctx context.Context, caseID, companyID string, req SaveCostDataRequest) (*CostDataResponse, error) {
	// Trim string fields (RULE-023)
	req.PaymentTerm = strings.TrimSpace(req.PaymentTerm)

	// TC-VAL-001: targetMargin == 0 → 422 (caught by validate tag gt=0)
	if err := validator.Validate(req); err != nil {
		if req.TargetMargin == 0 {
			return nil, apperror.New("UNPROCESSABLE", "zero_margin_not_allowed: targetMargin must be > 0", 422)
		}
		return nil, apperror.ErrValidation
	}

	// Load existing to preserve createdAt on upsert
	existing, _ := s.repo.GetByCaseID(ctx, caseID)

	data := &CostData{
		CaseID:         caseID,
		CompanyID:      companyID,
		HPP:            req.HPP,
		Packaging:      req.Packaging,
		Certification:  req.Certification,
		Transportation: req.Transportation,
		Freight:        req.Freight,
		Insurance:      req.Insurance,
		ExchangeRate:   req.ExchangeRate,
		TargetMargin:   req.TargetMargin,
		Quantity:       req.Quantity,
		PaymentTerm:    req.PaymentTerm,
	}
	if existing != nil {
		data.CreatedAt = existing.CreatedAt
	}

	if err := s.repo.Upsert(ctx, data); err != nil {
		return nil, err
	}

	warnings := buildWarnings(req)
	resp := toResponse(data, warnings)
	return resp, nil
}

// GetCostData retrieves persisted cost data for a case.
func (s *Service) GetCostData(ctx context.Context, caseID string) (*CostDataResponse, error) {
	data, err := s.repo.GetByCaseID(ctx, caseID)
	if err != nil {
		return nil, err
	}
	return toResponse(data, nil), nil
}

// buildWarnings generates SRS business-rule warnings (do not block save).
func buildWarnings(req SaveCostDataRequest) []string {
	var w []string
	if req.Packaging == 0 {
		w = append(w, "packaging_zero")
	}
	if req.Certification == 0 {
		w = append(w, "certification_zero")
	}
	if req.Transportation == 0 {
		w = append(w, "transportation_zero")
	}
	if req.Freight == 0 {
		w = append(w, "freight_zero")
	}
	if req.Insurance == 0 {
		w = append(w, "insurance_zero")
	}
	if req.ExchangeRate < 1000 {
		w = append(w, "low_exchange_rate")
	}
	if req.TargetMargin < 5 {
		w = append(w, "low_margin")
	}
	return w
}

func toResponse(d *CostData, warnings []string) *CostDataResponse {
	return &CostDataResponse{
		CaseID:         d.CaseID,
		CompanyID:      d.CompanyID,
		HPP:            d.HPP,
		Packaging:      d.Packaging,
		Certification:  d.Certification,
		Transportation: d.Transportation,
		Freight:        d.Freight,
		Insurance:      d.Insurance,
		ExchangeRate:   d.ExchangeRate,
		TargetMargin:   d.TargetMargin,
		Quantity:       d.Quantity,
		PaymentTerm:    d.PaymentTerm,
		UpdatedAt:      d.UpdatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		Warnings:       warnings,
	}
}

// actorCompanyID extracts the companyId from context (used in handler).
func actorCompanyID(ctx context.Context) string {
	u, ok := actor.FromContext(ctx)
	if !ok {
		return ""
	}
	return u.CompanyID
}
