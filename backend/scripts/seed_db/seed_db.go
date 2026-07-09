// Complete Database Seeding Script for EXORA Multi-tenant SaaS
// Usage: go run ./scripts/seed_db/seed_db.go
package main

import (
	"context"
	"log"
	"time"

	"firebase.google.com/go/v4/auth"

	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/advisor"
	"github.com/exora/backend/internal/domain/company"
	"github.com/exora/backend/internal/domain/costing"
	"github.com/exora/backend/internal/domain/document"
	"github.com/exora/backend/internal/domain/exportcase"
	"github.com/exora/backend/internal/domain/financial"
	"github.com/exora/backend/internal/domain/invitation"
	"github.com/exora/backend/internal/domain/pricing"
	"github.com/exora/backend/internal/domain/risk"
	"github.com/exora/backend/internal/domain/scenario"
	"github.com/exora/backend/internal/domain/user"
	firebaseauth "github.com/exora/backend/internal/platform/firebaseauth"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
)

func main() {
	log.Println("Starting full Firestore database seeding...")

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

	now := time.Now().UTC()

	// --- 1. Companies ---
	companies := map[string]*company.Company{
		"company-wacanatech": {
			ApplicantUserID: "usr_owner",
			CompanyName:     "WacanaTech Coffee Export",
			BusinessSector:  "Agriculture & F&B",
			Country:         "Indonesia",
			Status:          company.StatusApproved,
			SubmittedAt:     now.Add(-48 * time.Hour),
			ApprovedAt:      &now,
			UpdatedAt:       now,
		},
		"company-pending": {
			ApplicantUserID: "usr_guest",
			CompanyName:     "IndoSpices Corp",
			BusinessSector:  "Spices & Herbs Distribution",
			Country:         "Indonesia",
			Status:          company.StatusPending,
			SubmittedAt:     now.Add(-2 * time.Hour),
			UpdatedAt:       now,
		},
	}

	for id, c := range companies {
		_, err := fs.Client.Collection("companies").Doc(id).Set(ctx, c)
		if err != nil {
			log.Fatalf("Failed to seed company %s: %v", id, err)
		}
		log.Printf("Seeded Company: %s (%s)", id, c.CompanyName)
	}

	// --- 2. Users ---
	users := map[string]*user.User{
		"usr_admin": {
			FirebaseUID: "mock-firebase-admin-uid",
			Email:       "sheryl.kaparang@student.president.ac.id",
			DisplayName: "System Administrator",
			Role:        user.RoleAdmin,
			Status:      user.StatusActive,
			CreatedAt:   now.Add(-100 * time.Hour),
			UpdatedAt:   now,
		},
		"usr_owner": {
			FirebaseUID: "mock-firebase-owner-uid",
			Email:       "sherylkaparang5@gmail.com",
			DisplayName: "Praisilia Anastasya (Owner)",
			Role:        user.RoleCompanyOwner,
			CompanyID:   "company-wacanatech",
			Status:      user.StatusActive,
			CreatedAt:   now.Add(-48 * time.Hour),
			UpdatedAt:   now,
		},
		"usr_manager": {
			FirebaseUID: "mock-firebase-manager-uid",
			Email:       "sharon5558sk@gmail.com",
			DisplayName: "Sheryl Export Manager",
			Role:        user.RoleExportManager,
			CompanyID:   "company-wacanatech",
			Status:      user.StatusActive,
			CreatedAt:   now.Add(-24 * time.Hour),
			UpdatedAt:   now,
		},
		"usr_finance": {
			FirebaseUID: "mock-firebase-finance-uid",
			Email:       "3ryl0n@gmail.com",
			DisplayName: "Anastasya Finance Staff",
			Role:        user.RoleFinanceStaff,
			CompanyID:   "company-wacanatech",
			Status:      user.StatusActive,
			CreatedAt:   now.Add(-24 * time.Hour),
			UpdatedAt:   now,
		},
		"usr_guest": {
			FirebaseUID: "mock-firebase-guest-uid",
			Email:       "guest@exora.app",
			DisplayName: "Pending Guest Applicant",
			Role:        user.RoleGuest,
			Status:      user.StatusActive,
			CreatedAt:   now.Add(-2 * time.Hour),
			UpdatedAt:   now,
		},
	}

	// Ensure Firebase Auth users exist and populate real Firebase UIDs.
	fbAuth, err := firebaseauth.NewClient(ctx, cfg.FirebaseCredentialsPath)
	if err != nil {
		log.Fatalf("Failed to init firebase auth client: %v", err)
	}

	// Password overrides for local/dev testing (do NOT use in production)
	passwordOverrides := map[string]string{
		"sheryl.kaparang@student.president.ac.id": "sheryl58",
		"sherylkaparang5@gmail.com":               "password123",
		"sharon5558sk@gmail.com":                  "sharon58",
		"3ryl0n@gmail.com":                        "password",
	}

	for id, u := range users {
		// Try to find existing Firebase user by email
		rec, err := fbAuth.Auth.GetUserByEmail(ctx, u.Email)
		if err == nil {
			u.FirebaseUID = rec.UID
			log.Printf("Linked existing Firebase user for %s -> %s", u.Email, u.FirebaseUID)

			// If a password override exists and we're not in production, update the Firebase user's password
			if pwd, ok := passwordOverrides[u.Email]; ok && cfg.Environment != "production" {
				_, upErr := fbAuth.Auth.UpdateUser(ctx, rec.UID, (&auth.UserToUpdate{}).Password(pwd))
				if upErr != nil {
					log.Printf("Warning: failed to update password for %s: %v", u.Email, upErr)
				} else {
					log.Printf("Updated password for Firebase user %s (for local testing)", u.Email)
				}
			}
		} else {
			// Create a new Firebase user with a temporary password
			create := (&auth.UserToCreate{}).Email(u.Email).Password("ChangeMe123!").DisplayName(u.DisplayName).EmailVerified(true)
			rec2, err := fbAuth.Auth.CreateUser(ctx, create)
			if err != nil {
				log.Fatalf("Failed to create firebase user for %s: %v", u.Email, err)
			}
			u.FirebaseUID = rec2.UID
			log.Printf("Created Firebase user for %s -> %s", u.Email, u.FirebaseUID)
		}

		_, err = fs.Client.Collection("users").Doc(id).Set(ctx, u)
		if err != nil {
			log.Fatalf("Failed to seed user %s: %v", id, err)
		}
		log.Printf("Seeded User: %s (%s - %s)", id, u.DisplayName, u.Role)
	}

	// --- 3. Invitations ---
	invs := map[string]*invitation.Invitation{
		"inv_pending_manager": {
			CompanyID: "company-wacanatech",
			Email:     "new_manager@wacanatech.com",
			Role:      user.RoleExportManager,
			Token:     "mock-token-active-manager",
			Status:    invitation.StatusPending,
			InvitedBy: "usr_owner",
			ExpiresAt: now.Add(168 * time.Hour),
			CreatedAt: now,
		},
	}

	for id, inv := range invs {
		_, err := fs.Client.Collection("invitations").Doc(id).Set(ctx, inv)
		if err != nil {
			log.Fatalf("Failed to seed invitation %s: %v", id, err)
		}
		log.Printf("Seeded Invitation: %s -> %s", id, inv.Email)
	}

	// --- 4. Export Cases ---
	fScore := 83.5
	cases := map[string]*exportcase.ExportCase{
		"case-coffee-tokyo": {
			CompanyID:          "company-wacanatech",
			Name:               "Arabica Coffee to Tokyo Port",
			Product:            "Java Specialty Preanger Arabica Coffee Beans",
			DestinationCountry: "Japan",
			Status:             exportcase.StatusInReview,
			FeasibilityScore:   &fScore,
			CreatedBy:          "usr_manager",
			CreatedAt:          now.Add(-10 * time.Hour),
			UpdatedAt:          now,
		},
	}

	for id, ec := range cases {
		_, err := fs.Client.Collection("export_cases").Doc(id).Set(ctx, ec)
		if err != nil {
			log.Fatalf("Failed to seed export case %s: %v", id, err)
		}
		log.Printf("Seeded Export Case: %s (%s)", id, ec.Name)
	}

	// --- 5. Cost Data ---
	costs := map[string]*costing.CostData{
		"case-coffee-tokyo": {
			CaseID:         "case-coffee-tokyo",
			CompanyID:      "company-wacanatech",
			HPP:            1150000,
			Packaging:      50000,
			Certification:  100000,
			Transportation: 200000,
			Freight:        400000,
			Insurance:      80000,
			ExchangeRate:   16300,
			TargetMargin:   20.0,
			Quantity:       5000,
			PaymentTerm:    costing.PaymentTermTT,
			CreatedAt:      now.Add(-9 * time.Hour),
			UpdatedAt:      now,
		},
	}

	for id, cd := range costs {
		_, err := fs.Client.Collection("cost_data").Doc(id).Set(ctx, cd)
		if err != nil {
			log.Fatalf("Failed to seed cost data %s: %v", id, err)
		}
		log.Printf("Seeded Cost Data for case: %s", id)
	}

	// --- 6. Pricing Results ---
	pricingResults := map[string]*pricing.PricingResult{
		"case-coffee-tokyo": {
			CaseID:          "case-coffee-tokyo",
			CompanyID:       "company-wacanatech",
			Incoterm:        pricing.IncotermCIF,
			TotalCostIDR:    1980000,
			ProfitIDR:       396000,
			SellingPriceIDR: 2376000,
			SellingPriceUSD: 145.77,
			ExchangeRate:    16300,
			TargetMargin:    20.0,
			ActualMarginPct: 16.67,
			Breakdown: pricing.IncotermCostBreakdown{
				HPP:            1150000,
				Packaging:      50000,
				Certification:  100000,
				Transportation: 200000,
				Freight:        400000,
				Insurance:      80000,
				TotalCostIDR:   1980000,
			},
			CalculatedAt: now.Add(-8 * time.Hour),
		},
	}

	for id, pr := range pricingResults {
		_, err := fs.Client.Collection("pricing_results").Doc(id).Set(ctx, pr)
		if err != nil {
			log.Fatalf("Failed to seed pricing results %s: %v", id, err)
		}
		log.Printf("Seeded Pricing Result for case: %s", id)
	}

	// --- 7. Financial Analysis ---
	financials := map[string]*financial.FinancialAnalysis{
		"case-coffee-tokyo": {
			CaseID:           "case-coffee-tokyo",
			CompanyID:        "company-wacanatech",
			SelectedIncoterm: pricing.IncotermCIF,
			Quantity:         5000,
			SellingPriceIDR:  2376000,
			TotalCostIDR:     1980000,
			RevenueIDR:       11880000000,
			GrossProfitIDR:   1980000000,
			ProfitMarginPct:  16.67,
			ROIPct:           20.00,
			BreakEvenQty:     0.66,
			CalculatedAt:     now.Add(-7 * time.Hour),
		},
	}

	for id, fa := range financials {
		_, err := fs.Client.Collection("financial_analysis").Doc(id).Set(ctx, fa)
		if err != nil {
			log.Fatalf("Failed to seed financial analysis %s: %v", id, err)
		}
		log.Printf("Seeded Financial Analysis for case: %s", id)
	}

	// --- 8. Scenarios ---
	scenMarginOverride := 25.0
	scenarios := map[string]*scenario.Scenario{
		"scen-coffee-exw-high": {
			CaseID:               "case-coffee-tokyo",
			CompanyID:            "company-wacanatech",
			Name:                 "Japan EXW Alternative with 25% Margin",
			Notes:                "Simulation for local EXW pickup without sea shipping freight & insurance",
			Incoterm:             pricing.IncotermEXW,
			TargetMarginOverride: &scenMarginOverride,
			TotalCostIDR:         1300000,
			SellingPriceIDR:      1625000,
			SellingPriceUSD:      99.69,
			ProfitIDR:            325000,
			ActualMarginPct:      20.00,
			CreatedAt:            now.Add(-6 * time.Hour),
		},
	}

	for id, sc := range scenarios {
		_, err := fs.Client.Collection("scenarios").Doc(id).Set(ctx, sc)
		if err != nil {
			log.Fatalf("Failed to seed scenario %s: %v", id, err)
		}
		log.Printf("Seeded Scenario: %s (%s)", id, sc.Name)
	}

	// --- 9. Risk Assessments ---
	risks := map[string]*risk.RiskAssessment{
		"case-coffee-tokyo": {
			CaseID:             "case-coffee-tokyo",
			CompanyID:          "company-wacanatech",
			CountryRiskLevel:   risk.CountryRiskLow,
			CountryRiskScore:   risk.CountryScoreLow,
			PaymentTerm:        costing.PaymentTermTT,
			PaymentTermScore:   risk.PaymentScoreTT,
			ProfitabilityScore: 75.0,
			FeasibilityScore:   83.5,
			FeasibilityClass:   risk.FeasibilityHigh,
			ActualMarginPct:    16.67,
			TargetMarginPct:    20.0,
			DestinationCountry: "Japan",
			CalculatedAt:       now.Add(-5 * time.Hour),
		},
	}

	for id, r := range risks {
		_, err := fs.Client.Collection("risk_assessments").Doc(id).Set(ctx, r)
		if err != nil {
			log.Fatalf("Failed to seed risk assessment %s: %v", id, err)
		}
		log.Printf("Seeded Risk Assessment for case: %s", id)
	}

	// --- 10. AI Advisor ---
	recs := map[string]*advisor.AdvisorRecommendation{
		"case-coffee-tokyo": {
			CaseID:         "case-coffee-tokyo",
			CompanyID:      "company-wacanatech",
			Answer:         "EXORA DECISION SUPPORT ASSESSMENT:\n\n1. Feasibility: High Feasibility (Score: 83.5)\n2. Country Analysis: Japan risk profile is LOW (Stable exchange rate and strong legal trade compliance).\n3. Pricing: Actual margin achieved is 16.67%, slightly below the target 20%. Consider requesting a volume-based shipping discount to reduce freight costs.\n4. Risk Actions: T/T payment term risk is moderate. We advise negotiating 30% advance deposit with 70% paid against copy of Bill of Lading (B/L) to secure cash flow.",
			Sources:        []string{"knowledge-base snippet 1", "knowledge-base snippet 2"},
			Confidence:     "high",
			ContextSummary: "Export Case: Arabica Coffee to Tokyo Port | Product: Arabica Coffee Beans | Destination: Japan\nCost Data: HPP=1,150,000 IDR, targetMargin=20%",
			GeneratedAt:    now.Add(-4 * time.Hour),
		},
	}

	for id, rec := range recs {
		_, err := fs.Client.Collection("advisor_recommendations").Doc(id).Set(ctx, rec)
		if err != nil {
			log.Fatalf("Failed to seed advisor recommendation %s: %v", id, err)
		}
		log.Printf("Seeded AI Advisor Recommendation for case: %s", id)
	}

	// --- 11. Documents ---
	docs := map[string]*document.Document{
		"doc_coffee_quotation": {
			CaseID:       "case-coffee-tokyo",
			CompanyID:    "company-wacanatech",
			DocumentType: document.TypeQuotation,
			Filename:     "exora_quotation_case-coffee-tokyo.pdf",
			DownloadURL:  "http://localhost:8080/v1/documents/doc_coffee_quotation/download",
			GeneratedAt:  now.Add(-3 * time.Hour),
		},
	}

	for id, d := range docs {
		_, err := fs.Client.Collection("documents").Doc(id).Set(ctx, d)
		if err != nil {
			log.Fatalf("Failed to seed document metadata %s: %v", id, err)
		}
		log.Printf("Seeded Document: %s (%s)", id, d.Filename)
	}

	log.Println("--- DATABASE SEED COMPLETE: SUCCESS ---")
}
