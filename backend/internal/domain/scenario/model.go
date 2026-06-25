package scenario

import "time"

// Scenario is a named pricing variant for an export case, persisted to Firestore.
// Each scenario represents a different Incoterm/margin combination for "what-if" analysis.
type Scenario struct {
	ID                   string    `json:"-" firestore:"-"`
	CaseID               string    `json:"caseId" firestore:"caseId"`
	CompanyID            string    `json:"companyId" firestore:"companyId"`
	Name                 string    `json:"name" firestore:"name"`
	Notes                string    `json:"notes,omitempty" firestore:"notes,omitempty"`
	Incoterm             string    `json:"incoterm" firestore:"incoterm"`
	TargetMarginOverride *float64  `json:"targetMarginOverride,omitempty" firestore:"targetMarginOverride,omitempty"`
	// Snapshot of the pricing result for this scenario
	TotalCostIDR         float64   `json:"totalCostIDR" firestore:"totalCostIDR"`
	SellingPriceIDR      float64   `json:"sellingPriceIDR" firestore:"sellingPriceIDR"`
	SellingPriceUSD      float64   `json:"sellingPriceUSD" firestore:"sellingPriceUSD"`
	ProfitIDR            float64   `json:"profitIDR" firestore:"profitIDR"`
	ActualMarginPct      float64   `json:"actualMarginPct" firestore:"actualMarginPct"`
	CreatedAt            time.Time `json:"createdAt" firestore:"createdAt"`
}

// CreateScenarioRequest is the request body for POST /scenarios.
type CreateScenarioRequest struct {
	Name                 string   `json:"name" validate:"required,min=2,max=200"`
	Incoterm             string   `json:"incoterm" validate:"required,oneof=EXW FOB CFR CIF"`
	TargetMarginOverride *float64 `json:"targetMarginOverride,omitempty" validate:"omitempty,gt=0,lte=100"`
	Notes                string   `json:"notes,omitempty" validate:"omitempty,max=500"`
}

// ScenarioListItem is a summary item for list/compare responses.
type ScenarioListItem struct {
	ScenarioID      string   `json:"scenarioId"`
	CaseID          string   `json:"caseId"`
	Name            string   `json:"name"`
	Incoterm        string   `json:"incoterm"`
	TotalCostIDR    float64  `json:"totalCostIDR"`
	SellingPriceIDR float64  `json:"sellingPriceIDR"`
	SellingPriceUSD float64  `json:"sellingPriceUSD"`
	ActualMarginPct float64  `json:"actualMarginPct"`
	CreatedAt       string   `json:"createdAt"`
}
