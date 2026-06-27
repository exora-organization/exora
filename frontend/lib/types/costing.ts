export interface SaveCostDataRequest {
  hpp: number;
  packaging: number;
  certification: number;
  transportation: number;
  freight: number;
  insurance: number;
  exchangeRate: number;
  targetMargin: number;
  quantity: number;
  paymentTerm: "L/C" | "T/T" | "Doc. Collection" | "Open Account";
}

export interface CostDataResponse {
  caseId: string;
  companyId: string;
  hpp: number;
  packaging: number;
  certification: number;
  transportation: number;
  freight: number;
  insurance: number;
  exchangeRate: number;
  targetMargin: number;
  quantity: number;
  paymentTerm: string;
  updatedAt: string;
  warnings?: string[];
}
