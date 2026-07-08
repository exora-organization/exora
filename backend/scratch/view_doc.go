package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

type AdvisorRecommendation struct {
	ID             string    `json:"id" firestore:"-"`
	CaseID         string    `json:"caseId" firestore:"caseId"`
	CompanyID      string    `json:"companyId" firestore:"companyId"`
	Answer         string    `json:"answer" firestore:"answer"`
	Sources        []string  `json:"sources" firestore:"sources"`
	Confidence     string    `json:"confidence" firestore:"confidence"`
	ContextSummary string    `json:"contextSummary" firestore:"contextSummary"`
}

func main() {
	os.Setenv("FIREBASE_CREDENTIALS_PATH", "./serviceAccountKey.json")
	os.Setenv("FIRESTORE_PROJECT_ID", "exora-8d6c7")

	ctx := context.Background()
	client, err := firestore.NewClient(ctx, "exora-8d6c7", option.WithCredentialsFile("./serviceAccountKey.json"))
	if err != nil {
		fmt.Printf("Error client: %v\n", err)
		return
	}
	defer client.Close()

	// Get global recommendation
	// It was saved under global-<companyID>
	// Let's list all documents in advisor_recommendations
	docs, err := client.Collection("advisor_recommendations").Documents(ctx).GetAll()
	if err != nil {
		fmt.Printf("Error docs: %v\n", err)
		return
	}

	for _, doc := range docs {
		var rec AdvisorRecommendation
		doc.DataTo(&rec)
		rec.ID = doc.Ref.ID
		fmt.Printf("Doc ID: %s\n", rec.ID)
		b, _ := json.MarshalIndent(rec, "", "  ")
		fmt.Println(string(b))
		fmt.Println("-------------------------------------------")
	}
}
