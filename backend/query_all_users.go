//go:build ignore

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/exora/backend/internal/config"
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

	iter := fs.Client.Collection("users").Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}

	fmt.Printf("Total users in database: %d\n", len(docs))
	for i, doc := range docs {
		data := doc.Data()
		bytes, _ := json.Marshal(data)
		fmt.Printf("User %d (ID: %s): %s\n", i+1, doc.Ref.ID, string(bytes))
	}
}
