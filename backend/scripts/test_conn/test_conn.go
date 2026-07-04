// Database Connectivity Check Utility
// Usage: go run ./scripts/test_conn/test_conn.go
package main

import (
	"context"
	"log"
	"time"

	"github.com/exora/backend/internal/config"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

func main() {
	log.Println("Starting Database Connectivity Check...")

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("FAIL: Failed to load config: %v", err)
	}

	log.Printf("Connecting to Firestore Project: %s using Key at: %s", cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fs, err := firestoreclient.NewClient(ctx, cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("FAIL: Failed to initialize firestore client: %v", err)
	}
	defer fs.Close()

	// Try writing a temporary diagnostic entry
	testDocRef := fs.Client.Collection("diagnostic_tests").Doc("connectivity_probe")
	_, err = testDocRef.Set(ctx, map[string]interface{}{
		"lastChecked": time.Now().UTC(),
		"status":      "ok",
	})
	if err != nil {
		log.Fatalf("FAIL: Failed to write test document to Firestore: %v", err)
	}

	log.Println("SUCCESS: Write operation verified.")

	// Try reading it back
	snap, err := testDocRef.Get(ctx)
	if err != nil {
		log.Fatalf("FAIL: Failed to read test document from Firestore: %v", err)
	}

	data := snap.Data()
	log.Printf("SUCCESS: Read operation verified. Diagnostic status: %v", data["status"])

	// Try deleting it
	_, err = testDocRef.Delete(ctx)
	if err != nil {
		log.Printf("WARNING: Cleanup failed to delete check document: %v", err)
	} else {
		log.Println("SUCCESS: Cleanup operation verified.")
	}

	log.Println("--- DATABASE CONNECTIVITY CHECK: SUCCESS ---")
}
