package advisor

import "time"

type RAGRetrievalHealth struct {
	AverageLatencyMs  float64 `json:"averageLatencyMs"`
	SLALimitMs        float64 `json:"slaLimitMs"`
	SLACompliancePct  float64 `json:"slaCompliancePct"`
	SuccessRatePct    float64 `json:"successRatePct"`
	TotalQueriesCount int     `json:"totalQueriesCount"`
}

type KBCoverageStatus struct {
	Country    string    `json:"country"`
	Status     string    `json:"status"` // "Complete", "Empty", "Outdated"
	LastUpdate time.Time `json:"lastUpdate"`
}

type RecommendationSample struct {
	Timestamp       time.Time `json:"timestamp"`
	CompanyID       string    `json:"companyId"`
	Destination     string    `json:"destination"`
	Topic           string    `json:"topic"`
	Confidence      string    `json:"confidence"`
	LatencyMs       int       `json:"latencyMs"`
	TokensRetrieved int       `json:"tokensRetrieved"`
}

type AnomalyLog struct {
	Timestamp time.Time `json:"timestamp"`
	Severity  string    `json:"severity"` // "INFO", "WARN", "ERROR"
	Module    string    `json:"module"`   // "RAG", "LLM", "FIRESTORE"
	Message   string    `json:"message"`
}

type AdvisorHealthStats struct {
	RetrievalHealth RAGRetrievalHealth     `json:"retrievalHealth"`
	KBCoverage      []KBCoverageStatus     `json:"kbCoverage"`
	Samples         []RecommendationSample `json:"samples"`
	AnomalyLogs     []AnomalyLog           `json:"anomalyLogs"`
}
