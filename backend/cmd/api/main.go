package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/exora/backend/internal/config"
	"github.com/exora/backend/internal/domain/admin"
	"github.com/exora/backend/internal/domain/advisor"
	"github.com/exora/backend/internal/domain/analytics"
	"github.com/exora/backend/internal/domain/auth"
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
	"github.com/exora/backend/internal/middleware"
	firebaseauth "github.com/exora/backend/internal/platform/firebaseauth"
	firestoreclient "github.com/exora/backend/internal/platform/firestore"
	"github.com/exora/backend/internal/platform/gemini"
	"github.com/exora/backend/internal/router"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	ctx := context.Background()

	fsClient, err := firestoreclient.NewClient(ctx, cfg.FirestoreProjectID, cfg.FirebaseCredentialsPath)
	if err != nil {
		slog.Error("failed to init firestore", "error", err)
		os.Exit(1)
	}
	defer fsClient.Close()

	fbAuth, err := firebaseauth.NewClient(ctx, cfg.FirebaseCredentialsPath)
	if err != nil {
		slog.Error("failed to init firebase auth", "error", err)
		os.Exit(1)
	}

	geminiClient := gemini.NewClient(cfg.GeminiAPIKey)

	// ── Platform repositories ─────────────────────────────────────────────────
	userRepo := user.NewFirestoreRepository(fsClient.Client)
	companyRepo := company.NewFirestoreRepository(fsClient.Client)
	adminRepo := admin.NewFirestoreRepository(fsClient.Client)
	invitationRepo := invitation.NewFirestoreRepository(fsClient.Client)
	exportCaseRepo := exportcase.NewFirestoreRepository(fsClient.Client)

	// ── Export engine repositories ────────────────────────────────────────────
	costingRepo := costing.NewFirestoreRepository(fsClient.Client)
	pricingRepo := pricing.NewFirestoreRepository(fsClient.Client)
	financialRepo := financial.NewFirestoreRepository(fsClient.Client)
	riskRepo := risk.NewFirestoreRepository(fsClient.Client)
	scenarioRepo := scenario.NewFirestoreRepository(fsClient.Client)
	advisorRepo := advisor.NewFirestoreRepository(fsClient.Client)
	documentRepo := document.NewFirestoreRepository(fsClient.Client)

	// ── Services ──────────────────────────────────────────────────────────────
	authSvc := auth.NewService(userRepo, companyRepo)
	companySvc := company.NewService(companyRepo)
	adminSvc := admin.NewService(adminRepo, companyRepo, userRepo)
	userSvc := user.NewService(userRepo, companyRepo, cfg.AppBaseURL)
	invitationSvc := invitation.NewService(invitationRepo, userRepo, companyRepo, cfg.InvitationTTL, cfg.AppBaseURL)
	exportCaseSvc := exportcase.NewService(exportCaseRepo)

	// Export engine services (each depends on costing/pricing repos for prerequisites)
	costingSvc := costing.NewService(costingRepo)
	pricingSvc := pricing.NewService(pricingRepo, costingRepo)
	financialSvc := financial.NewService(financialRepo, costingRepo, pricingRepo)
	scenarioSvc := scenario.NewService(scenarioRepo, costingRepo)
	riskSvc := risk.NewService(riskRepo, costingRepo, pricingRepo, exportCaseRepo)
	advisorSvc := advisor.NewService(
		geminiClient,
		advisor.NewKnowledgeBase("./knowledge-base"),
		advisorRepo,
		costingRepo,
		pricingRepo,
		exportCaseRepo,
	)
	documentSvc := document.NewService(
		documentRepo,
		costingRepo,
		pricingRepo,
		riskRepo,
		advisorRepo,
		exportCaseRepo,
		cfg.AppBaseURL,
	)
	analyticsSvc := analytics.NewService(exportCaseRepo)

	// ── Middleware ────────────────────────────────────────────────────────────
	firebaseMW := middleware.NewFirebaseMiddleware(fbAuth)
	authMW := middleware.NewAuthMiddleware(userRepo)
	auditRepo := &admin.AuditRepository{Repo: adminRepo}

	invitationHandler := invitation.NewHandler(invitationSvc)

	handler := router.New(
		router.Dependencies{
			Config:         cfg,
			Firebase:       firebaseMW,
			Auth:           authMW,
			AuditLogger:    auditRepo,
			ExportCaseRepo: exportCaseRepo,
		},
		router.Handlers{
			Auth:       auth.NewHandler(authSvc),
			Company:    company.NewHandler(companySvc),
			Admin:      admin.NewHandler(adminSvc),
			User:       user.NewHandler(userSvc, invitationHandler),
			Invitation: invitationHandler,
			ExportCase: exportcase.NewHandler(exportCaseSvc),
			Costing:    costing.NewHandler(costingSvc, exportCaseSvc),
			Pricing:    pricing.NewHandler(pricingSvc, exportCaseSvc),
			Financial:  financial.NewHandler(financialSvc, exportCaseSvc),
			Scenario:   scenario.NewHandler(scenarioSvc, exportCaseSvc),
			Risk:       risk.NewHandler(riskSvc, exportCaseSvc),
			Advisor:    advisor.NewHandler(advisorSvc, exportCaseSvc),
			Document:   document.NewHandler(documentSvc, exportCaseSvc),
			Analytics:  analytics.NewHandler(analyticsSvc),
		},
	)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("server starting", "port", cfg.Port, "env", cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown error", "error", err)
	}
	slog.Info("server stopped")
}
