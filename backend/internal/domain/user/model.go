package user

import "time"

const (
	RoleGuest         = "guest"
	RoleCompanyOwner  = "company_owner"
	RoleExportManager = "export_manager"
	RoleFinanceStaff  = "finance_staff"
	RoleAdmin         = "admin"

	StatusActive   = "active"
	StatusDisabled = "disabled"
)

type User struct {
	ID          string    `json:"-" firestore:"-"`
	FirebaseUID string    `json:"firebaseUid" firestore:"firebaseUid"`
	Email       string    `json:"email" firestore:"email"`
	DisplayName string    `json:"displayName" firestore:"displayName"`
	Role        string    `json:"role" firestore:"role"`
	CompanyID   string    `json:"companyId,omitempty" firestore:"companyId,omitempty"`
	Status      string    `json:"status" firestore:"status"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt" firestore:"updatedAt"`
}

type RegisterRequest struct {
	DisplayName    string `json:"displayName" validate:"required,min=1,max=100"`
	TurnstileToken string `json:"turnstileToken"`
}

type UpdateUserRequest struct {
	DisplayName *string `json:"displayName,omitempty" validate:"omitempty,min=1,max=100"`
	Status      *string `json:"status,omitempty" validate:"omitempty,oneof=active disabled"`
}

type ChangeRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=export_manager finance_staff company_owner guest"`
}

type InviteRequest struct {
	Email string `json:"email" validate:"required,email"`
	Role  string `json:"role" validate:"required,oneof=export_manager finance_staff"`
}

type SessionProfile struct {
	UserID        string  `json:"userId"`
	FirebaseUID   string  `json:"firebaseUid,omitempty"`
	Email         string  `json:"email"`
	DisplayName   string  `json:"displayName"`
	Role          string  `json:"role"`
	CompanyID     *string `json:"companyId"`
	CompanyStatus *string `json:"companyStatus"`
	Status        string  `json:"status"`
	CreatedAt     *string `json:"createdAt,omitempty"`
}

type UserResponse struct {
	UserID      string  `json:"userId"`
	Email       string  `json:"email"`
	DisplayName string  `json:"displayName"`
	Role        string  `json:"role"`
	CompanyID   *string `json:"companyId"`
	Status      string  `json:"status"`
	CreatedAt   string  `json:"createdAt"`
}
