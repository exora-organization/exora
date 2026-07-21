import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { FinancialAnalysisResponse, RecalculateAnalysisRequest } from "../types/financial";

export const apiFinancial = {
  getAnalysis: async (caseId: string, incoterm?: string): Promise<ApiResponse<FinancialAnalysisResponse>> => {
    const url = incoterm ? `/own-export-cases/${caseId}/financial-analysis?incoterm=${incoterm}` : `/own-export-cases/${caseId}/financial-analysis`;
    return apiClient<ApiResponse<FinancialAnalysisResponse>>(url, {
      method: "GET",
    });
  },

  recalculateAnalysis: async (caseId: string, data: RecalculateAnalysisRequest): Promise<ApiResponse<FinancialAnalysisResponse>> => {
    return apiClient<ApiResponse<FinancialAnalysisResponse>>(`/own-export-cases/${caseId}/financial-analysis/recalculate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
