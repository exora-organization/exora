package user

import (
	"context"
	"time"

	"github.com/exora/backend/internal/domain/company"
)

func BuildSessionProfile(u *User, co *company.Company) *SessionProfile {
	profile := &SessionProfile{
		UserID:      u.ID,
		FirebaseUID: u.FirebaseUID,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		Role:        u.Role,
		Status:      u.Status,
	}
	if u.CompanyID != "" {
		profile.CompanyID = &u.CompanyID
	}
	if co != nil {
		profile.CompanyStatus = &co.Status
	} else if u.CompanyID == "" {
		// check pending application handled by caller
	}
	created := u.CreatedAt.UTC().Format(time.RFC3339)
	profile.CreatedAt = &created
	return profile
}

func ToUserResponse(u *User) UserResponse {
	resp := UserResponse{
		UserID:      u.ID,
		Email:       u.Email,
		DisplayName: u.DisplayName,
		Role:        u.Role,
		Status:      u.Status,
		CreatedAt:   u.CreatedAt.UTC().Format(time.RFC3339),
	}
	if u.CompanyID != "" {
		resp.CompanyID = &u.CompanyID
	}
	return resp
}

func ResolveCompanyStatus(ctx context.Context, u *User, companies company.Repository) (*SessionProfile, error) {
	var co *company.Company
	var err error

	if u.CompanyID != "" {
		co, err = companies.GetByID(ctx, u.CompanyID)
		if err != nil {
			co = nil
		}
	} else {
		co, err = companies.GetByApplicantUserID(ctx, u.ID)
		if err != nil {
			co = nil
		}
	}

	profile := BuildSessionProfile(u, co)
	if co != nil && u.CompanyID == "" {
		profile.CompanyStatus = &co.Status
	}
	return profile, nil
}
