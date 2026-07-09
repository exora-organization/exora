package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"cloud.google.com/go/firestore"
	"github.com/exora/backend/internal/config"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

type AuditLog struct {
	ID        string    `json:"-" firestore:"-"`
	ActorID   string    `json:"actorId" firestore:"actorId"`
	Action    string    `json:"action" firestore:"action"`
	Resource  string    `json:"resource" firestore:"resource"`
	Details   any       `json:"details,omitempty" firestore:"details,omitempty"`
	Timestamp any       `json:"timestamp" firestore:"timestamp"` // Changed to any to see if date parsing is the issue
}

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

	docs, err := fs.Client.Collection("audit_logs").OrderBy("timestamp", firestore.Desc).Limit(50).Documents(ctx).GetAll()
	if err != nil {
		log.Fatalf("Query failed: %v", err)
	}

	var logs []AuditLog
	for _, doc := range docs {
		var entry AuditLog
		if err := doc.DataTo(&entry); err != nil {
			fmt.Printf("Doc %s failed DataTo: %v\n", doc.Ref.ID, err)
		} else {
			entry.ID = doc.Ref.ID
			logs = append(logs, entry)
		}
	}

	// Try to marshal
	bytes, err := json.Marshal(map[string]any{"auditLogs": logs})
	if err != nil {
		log.Fatalf("Failed to marshal: %v", err)
	}

	fmt.Printf("Successfully marshaled! Output size: %d bytes\n", len(bytes))
}
