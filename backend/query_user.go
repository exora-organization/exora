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

	email := "sheryl.kaparang@student.president.ac.id"
	iter := fs.Client.Collection("users").Where("email", "==", email).Documents(ctx)
	docs, err := iter.GetAll()
	if err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}

	fmt.Printf("Found %d user document(s) for email: %s\n", len(docs), email)
	for i, doc := range docs {
		data := doc.Data()
		bytes, _ := json.MarshalIndent(data, "", "  ")
		fmt.Printf("Document %d (ID: %s):\n%s\n", i+1, doc.Ref.ID, string(bytes))
	}
}

