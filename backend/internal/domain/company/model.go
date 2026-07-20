package company

import "time"

const (
	StatusPending           = "pending"
	StatusApproved          = "approved"
	StatusRejected          = "rejected"
	StatusRevisionRequested = "revision_requested"
)

type Company struct {
	ID             string     `json:"-" firestore:"-"`
	ApplicantUserID string    `json:"applicantUserId" firestore:"applicantUserId"`
	CompanyName    string     `json:"companyName" firestore:"companyName"`
	BusinessSector string     `json:"businessSector" firestore:"businessSector"`
	Country        string     `json:"country" firestore:"country"`
	Status         string     `json:"status" firestore:"status"`
	RevisionNotes  string     `json:"revisionNotes,omitempty" firestore:"revisionNotes,omitempty"`
	RejectReason   string     `json:"rejectReason,omitempty" firestore:"rejectReason,omitempty"`
	SubmittedAt    time.Time  `json:"submittedAt" firestore:"submittedAt"`
	ApprovedAt     *time.Time `json:"approvedAt,omitempty" firestore:"approvedAt,omitempty"`
	UpdatedAt      time.Time  `json:"updatedAt" firestore:"updatedAt"`
}

func (c *Company) GetCompanyID() string { return c.ID }

type ApplyRequest struct {
	CompanyName    string `json:"companyName" validate:"required,min=2,max=200"`
	BusinessSector string `json:"businessSector" validate:"required,min=2,max=100"`
	Country        string `json:"country" validate:"required,min=2,max=100"`
}

type ApplicationListItem struct {
	CompanyID      string    `json:"companyId"`
	CompanyName    string    `json:"companyName"`
	BusinessSector string    `json:"businessSector"`
	Country        string    `json:"country"`
	Status         string    `json:"status"`
	SubmittedAt    string    `json:"submittedAt"`
	Applicant      Applicant `json:"applicant"`
}

type Applicant struct {
	UserID      string `json:"userId"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
}

type ApplyResponse struct {
	CompanyID      string  `json:"companyId"`
	CompanyName    string  `json:"companyName"`
	BusinessSector string  `json:"businessSector"`
	Country        string  `json:"country"`
	Status         string  `json:"status"`
	SubmittedAt    string  `json:"submittedAt"`
	ApprovedAt     *string `json:"approvedAt"`
}

type ApplicationStatusResponse struct {
	CompanyID      *string `json:"companyId"`
	CompanyName    *string `json:"companyName"`
	BusinessSector *string `json:"businessSector"`
	Country        *string `json:"country"`
	Status         string  `json:"status"`
	SubmittedAt    *string `json:"submittedAt"`
	ApprovedAt     *string `json:"approvedAt"`
	RevisionNotes  *string `json:"revisionNotes"`
}

type ApproveResponse struct {
	CompanyID   string `json:"companyId"`
	Status      string `json:"status"`
	ApprovedAt  string `json:"approvedAt"`
	OwnerUserID string `json:"ownerUserId"`
	OwnerRole   string `json:"ownerRole"`
}

type RejectRequest struct {
	Reason string `json:"reason" validate:"required,min=5,max=500"`
}

type RevisionRequest struct {
	RevisionNotes string `json:"revisionNotes" validate:"required,min=5,max=500"`
}

type CompanyDetailResponse struct {
	CompanyID       string  `json:"companyId"`
	ApplicantUserID string  `json:"applicantUserId"`
	CompanyName     string  `json:"companyName"`
	BusinessSector  string  `json:"businessSector"`
	Country         string  `json:"country"`
	Status          string  `json:"status"`
	RevisionNotes   string  `json:"revisionNotes,omitempty"`
	RejectReason    string  `json:"rejectReason,omitempty"`
	SubmittedAt     string  `json:"submittedAt"`
	ApprovedAt      *string `json:"approvedAt,omitempty"`
	UpdatedAt       string  `json:"updatedAt"`
}

func ToCompanyDetailResponse(c *Company) CompanyDetailResponse {
	resp := CompanyDetailResponse{
		CompanyID:       c.ID,
		ApplicantUserID: c.ApplicantUserID,
		CompanyName:     c.CompanyName,
		BusinessSector:  c.BusinessSector,
		Country:         c.Country,
		Status:          c.Status,
		RevisionNotes:   c.RevisionNotes,
		RejectReason:    c.RejectReason,
		SubmittedAt:     c.SubmittedAt.UTC().Format(time.RFC3339),
		UpdatedAt:       c.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if c.ApprovedAt != nil {
		s := c.ApprovedAt.UTC().Format(time.RFC3339)
		resp.ApprovedAt = &s
	}
	return resp
}
