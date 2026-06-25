package exportcase

import "time"

const (
	StatusDraft     = "draft"
	StatusInReview  = "in_review"
	StatusFinalized = "finalized"
)

type ExportCase struct {
	ID                 string    `json:"-" firestore:"-"`
	CompanyID          string    `json:"companyId" firestore:"companyId"`
	Name               string    `json:"name" firestore:"name"`
	Product            string    `json:"product" firestore:"product"`
	DestinationCountry string    `json:"destinationCountry" firestore:"destinationCountry"`
	Status             string    `json:"status" firestore:"status"`
	FeasibilityScore   *float64  `json:"feasibilityScore,omitempty" firestore:"feasibilityScore,omitempty"`
	CreatedBy          string    `json:"createdBy" firestore:"createdBy"`
	AssignedTo         string    `json:"assignedTo,omitempty" firestore:"assignedTo,omitempty"`
	CreatedAt          time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt" firestore:"updatedAt"`
}

func (e *ExportCase) GetCompanyID() string { return e.CompanyID }

type CreateRequest struct {
	Name               string `json:"name" validate:"required,min=2,max=200"`
	Product            string `json:"product" validate:"required,min=2,max=200"`
	DestinationCountry string `json:"destinationCountry" validate:"required,min=2,max=100"`
}

type UpdateRequest struct {
	Name               *string  `json:"name,omitempty" validate:"omitempty,min=2,max=200"`
	Product            *string  `json:"product,omitempty" validate:"omitempty,min=2,max=200"`
	DestinationCountry *string  `json:"destinationCountry,omitempty" validate:"omitempty,min=2,max=100"`
	Status             *string  `json:"status,omitempty" validate:"omitempty,oneof=draft in_review finalized"`
	FeasibilityScore   *float64 `json:"feasibilityScore,omitempty"`
}

type CaseResponse struct {
	CaseID             string   `json:"caseId"`
	CompanyID          string   `json:"companyId"`
	Name               string   `json:"name"`
	Product            string   `json:"product,omitempty"`
	DestinationCountry string   `json:"destinationCountry"`
	Status             string   `json:"status"`
	FeasibilityScore   *float64 `json:"feasibilityScore,omitempty"`
	CreatedBy          string   `json:"createdBy,omitempty"`
	CreatedAt          string   `json:"createdAt"`
	UpdatedAt          string   `json:"updatedAt,omitempty"`
}

type ListItem struct {
	CaseID             string   `json:"caseId"`
	CompanyID          string   `json:"companyId"`
	Name               string   `json:"name"`
	DestinationCountry string   `json:"destinationCountry"`
	Status             string   `json:"status"`
	FeasibilityScore   *float64 `json:"feasibilityScore,omitempty"`
	CreatedAt          string   `json:"createdAt"`
}
