package main

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "exora-8d6c7", option.WithCredentialsFile("./serviceAccountKey.json"))
	if err != nil {
		log.Fatalf("failed to init firestore: %v", err)
	}
	defer client.Close()

	fmt.Println("Querying companies...")
	iter := client.Collection("companies").Documents(ctx)
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		data := doc.Data()
		fmt.Printf("Doc ID: %s | CompanyName: %v | Status: %v\n", doc.Ref.ID, data["companyName"], data["status"])
	}

	fmt.Println("\nQuerying users...")
	iterUsers := client.Collection("users").Documents(ctx)
	for {
		doc, err := iterUsers.Next()
		if err != nil {
			break
		}
		data := doc.Data()
		fmt.Printf("Doc ID: %s | Email: %v | Role: %v | CompanyID: %v\n", doc.Ref.ID, data["email"], data["role"], data["companyId"])
	}
}
