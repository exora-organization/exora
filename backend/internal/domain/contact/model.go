package contact

import "time"

type ContactMessage struct {
	ID          string    `json:"id" firestore:"-"`
	Name        string    `json:"name" firestore:"name" validate:"required,min=2"`
	Email       string    `json:"email" firestore:"email" validate:"required,email"`
	CompanyName string    `json:"companyName" firestore:"companyName"`
	Subject     string    `json:"subject" firestore:"subject" validate:"required,min=3"`
	Message     string    `json:"message" firestore:"message" validate:"required,min=10"`
	CreatedAt   time.Time `json:"createdAt" firestore:"createdAt"`
}

type SubmitRequest struct {
	Name           string `json:"name" validate:"required,min=2"`
	Email          string `json:"email" validate:"required,email"`
	CompanyName    string `json:"companyName"`
	Subject        string `json:"subject" validate:"required,min=3"`
	Message        string `json:"message" validate:"required,min=10"`
	RecaptchaToken string `json:"recaptchaToken" validate:"required"`
}
