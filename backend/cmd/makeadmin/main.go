package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/user"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run cmd/makeadmin/main.go <user-email>")
		os.Exit(1)
	}

	email := os.Args[1]

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	ctx := context.Background()

	fsClient, err := firestoreclient.NewClient(ctx, cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("failed to init firestore: %v", err)
	}
	defer fsClient.Close()

	userRepo := user.NewFirestoreRepository(fsClient.Client)

	u, err := userRepo.GetByEmail(ctx, email)
	if err != nil {
		log.Fatalf("failed to find user with email %s: %v", email, err)
	}

	u.Role = user.RoleAdmin
	u.CompanyID = "" // Admin does not belong to any company

	if err := userRepo.Update(ctx, u); err != nil {
		log.Fatalf("failed to update user: %v", err)
	}

	fmt.Printf("Successfully promoted %s to admin!\n", email)
}
