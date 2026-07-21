import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { CalculatePricingRequest, PricingResponse } from "../types/pricing";

export const apiPricing = {
  getPricing: async (caseId: string): Promise<ApiResponse<PricingResponse>> => {
    return apiClient<ApiResponse<PricingResponse>>(`/export-cases/${caseId}/pricing`, {
      method: "GET",
    });
  },

  calculatePricing: async (caseId: string, data: CalculatePricingRequest): Promise<ApiResponse<PricingResponse>> => {
    return apiClient<ApiResponse<PricingResponse>>(`/export-cases/${caseId}/pricing/calculate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
