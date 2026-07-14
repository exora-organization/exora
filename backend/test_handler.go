//go:build ignore

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"

	"github.com/exora/backend/internal/actor"
	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/admin"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/user"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	ctx := context.Background()
	fs, err := firestoreclient.NewClient(ctx, cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("Failed to connect to Firestore: %v", err)
	}
	defer fs.Close()

	adminRepo := admin.NewFirestoreRepository(fs.Client)
	companyRepo := company.NewFirestoreRepository(fs.Client)
	userRepo := user.NewFirestoreRepository(fs.Client)

	adminSvc := admin.NewService(adminRepo, companyRepo, userRepo)
	adminHandler := admin.NewHandler(adminSvc)

	// Create request
	req := httptest.NewRequest(http.MethodGet, "/v1/admin/audit-logs?limit=50", nil)

	// Inject admin actor
	act := &actor.User{
		ID:        "usr_admin",
		Email:     "sheryl.kaparang@student.president.ac.id",
		Role:      "admin",
		CompanyID: "",
	}
	req = req.WithContext(actor.WithUser(req.Context(), act))

	// Record response
	w := httptest.NewRecorder()
	adminHandler.ListAuditLogs(w, req)

	resp := w.Result()
	fmt.Printf("Status: %d\n", resp.StatusCode)
	fmt.Printf("Body: %s\n", w.Body.String())
}

