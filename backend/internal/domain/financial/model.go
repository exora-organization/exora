package financial

import "time"

// FinancialAnalysis is the SRS FR-013 model persisted to financial_analysis collection.
type FinancialAnalysis struct {
	ID              string    `json:"-" firestore:"-"`
	CaseID          string    `json:"caseId" firestore:"caseId"`
	CompanyID       string    `json:"companyId" firestore:"companyId"`
	SelectedIncoterm string   `json:"selectedIncoterm" firestore:"selectedIncoterm"`
	Quantity        float64   `json:"quantity" firestore:"quantity"`
	SellingPriceIDR float64   `json:"sellingPriceIDR" firestore:"sellingPriceIDR"`
	TotalCostIDR    float64   `json:"totalCostIDR" firestore:"totalCostIDR"`
	// SRS §5.2 metrics
	RevenueIDR      float64   `json:"revenueIDR" firestore:"revenueIDR"`
	GrossProfitIDR  float64   `json:"grossProfitIDR" firestore:"grossProfitIDR"`
	ProfitMarginPct float64   `json:"profitMarginPct" firestore:"profitMarginPct"`
	ROIPct          float64   `json:"roiPct" firestore:"roiPct"`
	BreakEvenQty    float64   `json:"breakEvenQty" firestore:"breakEvenQty"`
	CalculatedAt    time.Time `json:"calculatedAt" firestore:"calculatedAt"`
}

// RecalculateRequest is the request body for POST /financial-analysis/recalculate.
type RecalculateRequest struct {
	Incoterm string `json:"incoterm" validate:"required,oneof=EXW FOB CFR CIF"`
}
