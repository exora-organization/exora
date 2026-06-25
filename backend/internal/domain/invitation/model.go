package invitation

import "time"

const (
	StatusPending  = "pending"
	StatusAccepted = "accepted"
)

type Invitation struct {
	ID        string     `json:"-" firestore:"-"`
	CompanyID string     `json:"companyId" firestore:"companyId"`
	Email     string     `json:"email" firestore:"email"`
	Role      string     `json:"role" firestore:"role"`
	Token     string     `json:"-" firestore:"token"`
	Status    string     `json:"status" firestore:"status"`
	InvitedBy string     `json:"invitedBy" firestore:"invitedBy"`
	ExpiresAt time.Time  `json:"expiresAt" firestore:"expiresAt"`
	CreatedAt time.Time  `json:"createdAt" firestore:"createdAt"`
	AcceptedAt *time.Time `json:"acceptedAt,omitempty" firestore:"acceptedAt,omitempty"`
}

type InviteRequest struct {
	Email string `json:"email" validate:"required,email"`
	Role  string `json:"role" validate:"required,oneof=export_manager finance_staff"`
}

type InviteResponse struct {
	InvitationID string `json:"invitationId"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	CompanyID    string `json:"companyId"`
	Token        string `json:"token"`
	InviteURL    string `json:"inviteUrl"`
	Status       string `json:"status"`
	ExpiresAt    string `json:"expiresAt"`
	CreatedAt    string `json:"createdAt"`
}

type ListItem struct {
	InvitationID string `json:"invitationId"`
	Email        string `json:"email"`
	Role         string `json:"role"`
	Status       string `json:"status"`
	ExpiresAt    string `json:"expiresAt"`
}

type PreviewResponse struct {
	Email       string `json:"email"`
	Role        string `json:"role"`
	CompanyName string `json:"companyName"`
	Status      string `json:"status"`
	ExpiresAt   string `json:"expiresAt"`
}

type AcceptResponse struct {
	UserID           string `json:"userId"`
	Role             string `json:"role"`
	CompanyID        string `json:"companyId"`
	InvitationStatus string `json:"invitationStatus"`
}

type ResendRequest struct {
	InvitationID string `json:"invitationId" validate:"required"`
}
