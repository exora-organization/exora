export interface RecalculateAnalysisRequest {
  incoterm: "EXW" | "FOB" | "CFR" | "CIF";
}

export interface FinancialAnalysis {
  caseId: string;
  companyId: string;
  selectedIncoterm: string;
  quantity: number;
  sellingPriceIDR: number;
  totalCostIDR: number;
  revenueIDR: number;
  grossProfitIDR: number;
  profitMarginPct: number;
  roiPct: number;
  breakEvenQty: number;
  calculatedAt: string;
}

export interface FinancialAnalysisResponse {
  caseId: string;
  analysis: FinancialAnalysis;
}
