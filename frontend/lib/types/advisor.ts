export interface GenerateAdvisorRequest {
  question?: string;
}

export interface AdvisorRecommendation {
  caseId: string;
  companyId: string;
  answer: string;
  sources?: string[];
  confidence: string;
  contextSummary?: string;
  generatedAt: string;
}

export interface AdvisorRecommendationResponse {
  caseId: string;
  recommendation: AdvisorRecommendation;
}

export interface RAGRetrievalHealth {
  averageLatencyMs: number;
  slaLimitMs: number;
  slaCompliancePct: number;
  successRatePct: number;
  totalQueriesCount: number;
}

export interface KBCoverageStatus {
  country: string;
  status: string;
  lastUpdate: string;
}

export interface RecommendationSample {
  timestamp: string;
  companyId: string;
  destination: string;
  topic: string;
  confidence: string;
  latencyMs: number;
  tokensRetrieved: number;
}

export interface AnomalyLog {
  timestamp: string;
  severity: string;
  module: string;
  message: string;
}

export interface AdvisorHealthStats {
  retrievalHealth: RAGRetrievalHealth;
  kbCoverage: KBCoverageStatus[];
  samples: RecommendationSample[];
  anomalyLogs: AnomalyLog[];
}

