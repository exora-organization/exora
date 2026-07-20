package contact

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

type stubContactRepo struct {
	saved *ContactMessage
}

func (s *stubContactRepo) Save(ctx context.Context, msg *ContactMessage) error {
	s.saved = msg
	return nil
}

func TestVerifyGoogleRecaptchaAndSubmit(t *testing.T) {
	repo := &stubContactRepo{}
	
	// Create mock Google reCAPTCHA server
	var mockSuccess bool
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if mockSuccess {
			w.Write([]byte(`{"success": true}`))
		} else {
			w.Write([]byte(`{"success": false, "error-codes": ["invalid-input-response"]}`))
		}
	}))
	defer mockServer.Close()

	svc := NewService(repo, "test-secret")
	svc.verifyURL = mockServer.URL // Override with mock server

	// Test case 1: Successful verification
	mockSuccess = true
	req := SubmitRequest{
		Name:           "John Doe",
		Email:          "john@example.com",
		Subject:        "Inquiry",
		Message:        "This is a message that is longer than ten characters.",
		RecaptchaToken: "valid-token",
	}

	err := svc.SubmitMessage(context.Background(), req)
	if err != nil {
		t.Fatalf("expected successful message submission, got error: %v", err)
	}

	if repo.saved == nil {
		t.Fatal("expected message to be saved in repository")
	}
	if repo.saved.Name != "John Doe" {
		t.Errorf("expected saved name to be 'John Doe', got: %s", repo.saved.Name)
	}

	// Test case 2: Failed verification
	mockSuccess = false
	repo.saved = nil
	err = svc.SubmitMessage(context.Background(), req)
	if err == nil {
		t.Fatal("expected error for incorrect CAPTCHA answer")
	}
	if repo.saved != nil {
		t.Fatal("message should not have been saved on CAPTCHA failure")
	}
}
