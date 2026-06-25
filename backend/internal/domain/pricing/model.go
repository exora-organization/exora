package pricing

import "time"

// Incoterm constants per SRS §5.1.
const (
	IncotermEXW = "EXW"
	IncotermFOB = "FOB"
	IncotermCFR = "CFR"
	IncotermCIF = "CIF"
)

// CalculatePricingRequest is the request body for POST /pricing/calculate.
type CalculatePricingRequest struct {
	Incoterm string `json:"incoterm" validate:"required,oneof=EXW FOB CFR CIF"`
}

// IncotermCostBreakdown shows cost build-up per SRS §5.1.
type IncotermCostBreakdown struct {
	HPP            float64 `json:"hpp"`
	Packaging      float64 `json:"packaging"`
	Certification  float64 `json:"certification"`
	Transportation float64 `json:"transportation"`
	Freight        float64 `json:"freight"`
	Insurance      float64 `json:"insurance"`
	TotalCostIDR   float64 `json:"totalCostIDR"`
}

// PricingResult is the API response and Firestore model for pricing_results.
type PricingResult struct {
	ID               string                `json:"-" firestore:"-"`
	CaseID           string                `json:"caseId" firestore:"caseId"`
	CompanyID        string                `json:"companyId" firestore:"companyId"`
	Incoterm         string                `json:"incoterm" firestore:"incoterm"`
	TotalCostIDR     float64               `json:"totalCostIDR" firestore:"totalCostIDR"`
	ProfitIDR        float64               `json:"profitIDR" firestore:"profitIDR"`
	SellingPriceIDR  float64               `json:"sellingPriceIDR" firestore:"sellingPriceIDR"`
	SellingPriceUSD  float64               `json:"sellingPriceUSD" firestore:"sellingPriceUSD"`
	ExchangeRate     float64               `json:"exchangeRate" firestore:"exchangeRate"`
	TargetMargin     float64               `json:"targetMargin" firestore:"targetMargin"`
	ActualMarginPct  float64               `json:"actualMarginPct" firestore:"actualMarginPct"`
	Breakdown        IncotermCostBreakdown `json:"breakdown" firestore:"breakdown"`
	CalculatedAt     time.Time             `json:"calculatedAt" firestore:"calculatedAt"`
}

// AllPricingResults holds results for all 4 incoterms at once.
type AllPricingResults struct {
	CaseID  string           `json:"caseId"`
	Results []*PricingResult `json:"results"`
}
