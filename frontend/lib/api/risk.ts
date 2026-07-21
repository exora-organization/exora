import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { RiskAssessmentResponse } from "../types/risk";

export const apiRisk = {
  getRiskAssessment: async (caseId: string): Promise<ApiResponse<RiskAssessmentResponse>> => {
    return apiClient<ApiResponse<RiskAssessmentResponse>>(`/own-export-cases/${caseId}/risk-assessment`, {
      method: "GET",
    });
  },
};
