// Seed script: admin user and sample knowledge base entries.
// Usage: go run ./scripts/seed.go
package main

import (
	"context"
	"log"
	"os"

	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/user"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()
	fs, err := firestoreclient.NewClient(ctx, cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatal(err)
	}
	defer fs.Close()

	userRepo := user.NewFirestoreRepository(fs.Client)

	adminUID := os.Getenv("SEED_ADMIN_FIREBASE_UID")
	if adminUID == "" {
		adminUID = "seed-admin-uid"
	}

	admin := &user.User{
		FirebaseUID: adminUID,
		Email:       "admin@exora.local",
		DisplayName: "System Admin",
		Role:        user.RoleAdmin,
		Status:      user.StatusActive,
	}

	if err := userRepo.Create(ctx, admin); err != nil {
		log.Printf("admin seed (may already exist): %v", err)
	} else {
		log.Printf("seeded admin user: %s", admin.ID)
	}

	log.Println("seed complete — ensure knowledge-base/ files are populated")
}
