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
