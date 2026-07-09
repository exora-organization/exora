export interface RiskAssessment {
  caseId: string;
  companyId: string;
  countryRiskLevel: string;
  countryRiskScore: number;
  paymentTerm: string;
  paymentTermScore: number;
  profitabilityScore: number;
  feasibilityScore: number;
  feasibilityClass: string;
  actualMarginPct: number;
  targetMarginPct: number;
  destinationCountry: string;
  calculatedAt: string;
}

export interface RiskAssessmentResponse {
  caseId: string;
  assessment: RiskAssessment;
}
