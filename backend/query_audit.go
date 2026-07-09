package main

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/config"
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

	fmt.Println("Running audit logs query...")
	docs, err := fs.Client.Collection("audit_logs").OrderBy("timestamp", firestore.Desc).Limit(50).Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("Query failed: %v", err)
	}

	fmt.Printf("Query success! Loaded %d docs.\n", len(docs))
	for i, doc := range docs {
		fmt.Printf("%d: Data: %v\n", i, doc.Data())
	}
}
