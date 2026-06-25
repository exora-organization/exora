package costing

import "time"

// Payment term constants for risk assessment.
const (
	PaymentTermLC             = "L/C"
	PaymentTermTT             = "T/T"
	PaymentTermDocCollection  = "Doc. Collection"
	PaymentTermOpenAccount    = "Open Account"
)

// CostData is the SRS-compliant Firestore model for export cost data.
// All monetary amounts are in IDR.
type CostData struct {
	ID             string    `json:"-" firestore:"-"`
	CaseID         string    `json:"caseId" firestore:"caseId"`
	CompanyID      string    `json:"companyId" firestore:"companyId"`
	HPP            float64   `json:"hpp" firestore:"hpp"`
	Packaging      float64   `json:"packaging" firestore:"packaging"`
	Certification  float64   `json:"certification" firestore:"certification"`
	Transportation float64   `json:"transportation" firestore:"transportation"`
	Freight        float64   `json:"freight" firestore:"freight"`
	Insurance      float64   `json:"insurance" firestore:"insurance"`
	ExchangeRate   float64   `json:"exchangeRate" firestore:"exchangeRate"`
	TargetMargin   float64   `json:"targetMargin" firestore:"targetMargin"`
	Quantity       float64   `json:"quantity" firestore:"quantity"`
	PaymentTerm    string    `json:"paymentTerm" firestore:"paymentTerm"`
	CreatedAt      time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt" firestore:"updatedAt"`
}

// SaveCostDataRequest is the request body for PUT /cost-data.
type SaveCostDataRequest struct {
	HPP            float64 `json:"hpp" validate:"required,gt=0"`
	Packaging      float64 `json:"packaging" validate:"gte=0"`
	Certification  float64 `json:"certification" validate:"gte=0"`
	Transportation float64 `json:"transportation" validate:"gte=0"`
	Freight        float64 `json:"freight" validate:"gte=0"`
	Insurance      float64 `json:"insurance" validate:"gte=0"`
	ExchangeRate   float64 `json:"exchangeRate" validate:"required,gt=0"`
	TargetMargin   float64 `json:"targetMargin" validate:"gt=0,lte=100"`
	Quantity       float64 `json:"quantity" validate:"required,gt=0"`
	PaymentTerm    string  `json:"paymentTerm" validate:"required,oneof=L/C T/T Doc. Collection Open Account"`
}

// CostDataResponse is returned by the API, includes business-rule warnings.
type CostDataResponse struct {
	CaseID         string   `json:"caseId"`
	CompanyID      string   `json:"companyId"`
	HPP            float64  `json:"hpp"`
	Packaging      float64  `json:"packaging"`
	Certification  float64  `json:"certification"`
	Transportation float64  `json:"transportation"`
	Freight        float64  `json:"freight"`
	Insurance      float64  `json:"insurance"`
	ExchangeRate   float64  `json:"exchangeRate"`
	TargetMargin   float64  `json:"targetMargin"`
	Quantity       float64  `json:"quantity"`
	PaymentTerm    string   `json:"paymentTerm"`
	UpdatedAt      string   `json:"updatedAt"`
	Warnings       []string `json:"warnings,omitempty"`
}
