export interface CalculatePricingRequest {
  incoterm: "EXW" | "FOB" | "CFR" | "CIF";
}

export interface IncotermCostBreakdown {
  hpp: number;
  packaging: number;
  certification: number;
  transportation: number;
  freight: number;
  insurance: number;
  totalCostIDR: number;
}

export interface PricingResult {
  caseId: string;
  companyId: string;
  incoterm: string;
  totalCostIDR: number;
  profitIDR: number;
  sellingPriceIDR: number;
  sellingPriceUSD: number;
  exchangeRate: number;
  targetMargin: number;
  actualMarginPct: number;
  breakdown: IncotermCostBreakdown;
  calculatedAt: string;
}

export interface PricingResponse {
  caseId: string;
  pricing: PricingResult;
}
