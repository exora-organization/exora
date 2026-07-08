package costing

import (
	"context"
	"strings"
	"testing"

	"github.com/exora/backend/internal/apperror"
)

type mockRepository struct {
	data map[string]*CostData
}

func newMockRepository() *mockRepository {
	return &mockRepository{
		data: make(map[string]*CostData),
	}
}

func (m *mockRepository) Upsert(ctx context.Context, data *CostData) error {
	m.data[data.CaseID] = data
	return nil
}

func (m *mockRepository) GetByCaseID(ctx context.Context, caseID string) (*CostData, error) {
	d, ok := m.data[caseID]
	if !ok {
		return nil, apperror.ErrNotFound
	}
	return d, nil
}

func TestSaveCostData_Success(t *testing.T) {
	repo := newMockRepository()
	svc := NewService(repo)
	ctx := context.Background()

	// 1. Save valid cost data with no warnings
	req := SaveCostDataRequest{
		HPP:            1000000,
		Packaging:      50000,
		Certification:  100000,
		Transportation: 200000,
		Freight:        300000,
		Insurance:      50000,
		ExchangeRate:   16000,
		TargetMargin:   20.0,
		Quantity:       1000,
		PaymentTerm:    "T/T",
	}

	resp, err := svc.SaveCostData(ctx, "case-123", "company-abc", req)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if resp.CaseID != "case-123" {
		t.Errorf("expected CaseID case-123, got %s", resp.CaseID)
	}
	if resp.CompanyID != "company-abc" {
		t.Errorf("expected CompanyID company-abc, got %s", resp.CompanyID)
	}
	if len(resp.Warnings) != 0 {
		t.Errorf("expected no warnings, got %v", resp.Warnings)
	}

	// Verify it was stored in repo
	stored, err := repo.GetByCaseID(ctx, "case-123")
	if err != nil {
		t.Fatalf("expected to find stored record, got %v", err)
	}
	if stored.HPP != req.HPP {
		t.Errorf("expected stored HPP to match req HPP")
	}

	// 2. Save costing data with warnings (fields set to zero/low exchange rate/low margin)
	reqWithWarnings := SaveCostDataRequest{
		HPP:            1000000,
		Packaging:      0,
		Certification:  0,
		Transportation: 0,
		Freight:        0,
		Insurance:      0,
		ExchangeRate:   500, // low exchange rate (< 1000)
		TargetMargin:   4.0, // low margin (< 5)
		Quantity:       1000,
		PaymentTerm:    "L/C",
	}

	respWithWarnings, err := svc.SaveCostData(ctx, "case-123", "company-abc", reqWithWarnings)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expectedWarnings := map[string]bool{
		"packaging_zero":      true,
		"certification_zero":  true,
		"transportation_zero": true,
		"freight_zero":        true,
		"insurance_zero":      true,
		"low_exchange_rate":   true,
		"low_margin":          true,
	}

	for _, w := range respWithWarnings.Warnings {
		if !expectedWarnings[w] {
			t.Errorf("unexpected warning: %s", w)
		}
		delete(expectedWarnings, w)
	}
	if len(expectedWarnings) != 0 {
		t.Errorf("missing expected warnings: %v", expectedWarnings)
	}
}

func TestSaveCostData_ValidationFail(t *testing.T) {
	repo := newMockRepository()
	svc := NewService(repo)
	ctx := context.Background()

	// 1. Target Margin is 0 (should return 422 - zero_margin_not_allowed)
	reqZeroMargin := SaveCostDataRequest{
		HPP:            1000000,
		Packaging:      50000,
		ExchangeRate:   16000,
		TargetMargin:   0.0, // Invalid!
		Quantity:       1000,
		PaymentTerm:    "T/T",
	}

	_, err := svc.SaveCostData(ctx, "case-123", "company-abc", reqZeroMargin)
	if err == nil {
		t.Fatalf("expected error for zero target margin, got nil")
	}

	appErr, ok := err.(*apperror.AppError)
	if !ok {
		t.Fatalf("expected error to be *apperror.AppError, got %T", err)
	}
	if appErr.Code != "UNPROCESSABLE" || appErr.HTTPStatus != 422 || !strings.Contains(appErr.Message, "zero_margin_not_allowed") {
		t.Errorf("unexpected error format: Code=%s, Status=%d, Msg=%s", appErr.Code, appErr.HTTPStatus, appErr.Message)
	}

	// 2. Negative inputs / invalid fields (validation error)
	reqNegative := SaveCostDataRequest{
		HPP:            -1000, // Invalid!
		Packaging:      50000,
		ExchangeRate:   16000,
		TargetMargin:   15.0,
		Quantity:       1000,
		PaymentTerm:    "T/T",
	}

	_, err = svc.SaveCostData(ctx, "case-123", "company-abc", reqNegative)
	if err == nil {
		t.Fatalf("expected validation error for negative HPP, got nil")
	}
	if err != apperror.ErrValidation {
		t.Errorf("expected ErrValidation, got %v", err)
	}

	// 3. Invalid payment term
	reqInvalidPayTerm := SaveCostDataRequest{
		HPP:            100000,
		Packaging:      50000,
		ExchangeRate:   16000,
		TargetMargin:   15.0,
		Quantity:       1000,
		PaymentTerm:    "Cash", // Invalid payment term
	}

	_, err = svc.SaveCostData(ctx, "case-123", "company-abc", reqInvalidPayTerm)
	if err == nil {
		t.Fatalf("expected validation error for invalid payment term, got nil")
	}
	if err != apperror.ErrValidation {
		t.Errorf("expected ErrValidation, got %v", err)
	}
}

func TestGetCostData(t *testing.T) {
	repo := newMockRepository()
	svc := NewService(repo)
	ctx := context.Background()

	// 1. Get non-existent cost data should return error
	_, err := svc.GetCostData(ctx, "non-existent")
	if err == nil {
		t.Fatalf("expected error for non-existent case, got nil")
	}

	// 2. Get existing cost data
	data := &CostData{
		CaseID:         "case-xyz",
		CompanyID:      "company-abc",
		HPP:            500000,
		ExchangeRate:   16000,
		TargetMargin:   12.5,
		Quantity:       2500,
		PaymentTerm:    "T/T",
	}
	_ = repo.Upsert(ctx, data)

	resp, err := svc.GetCostData(ctx, "case-xyz")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.CaseID != "case-xyz" {
		t.Errorf("expected CaseID case-xyz, got %s", resp.CaseID)
	}
	if resp.HPP != 500000 {
		t.Errorf("expected HPP 500000, got %.2f", resp.HPP)
	}
	if resp.Quantity != 2500 {
		t.Errorf("expected Quantity 2500, got %.2f", resp.Quantity)
	}
}
