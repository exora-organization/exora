import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { AdvisorRecommendationResponse, GenerateAdvisorRequest } from "../types/advisor";

export const apiAdvisor = {
  getRecommendation: async (caseId: string): Promise<ApiResponse<AdvisorRecommendationResponse>> => {
    return apiClient<ApiResponse<AdvisorRecommendationResponse>>(`/export-cases/${caseId}/advisor/recommendations`, {
      method: "GET",
    });
  },

  generateRecommendation: async (caseId: string, data: GenerateAdvisorRequest = {}): Promise<ApiResponse<AdvisorRecommendationResponse>> => {
    return apiClient<ApiResponse<AdvisorRecommendationResponse>>(`/export-cases/${caseId}/advisor/recommendations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getGlobalRecommendation: async (): Promise<ApiResponse<AdvisorRecommendationResponse>> => {
    return apiClient<ApiResponse<AdvisorRecommendationResponse>>(`/advisor/recommendations`, {
      method: "GET",
    });
  },

  generateGlobalRecommendation: async (data: GenerateAdvisorRequest = {}): Promise<ApiResponse<AdvisorRecommendationResponse>> => {
    return apiClient<ApiResponse<AdvisorRecommendationResponse>>(`/advisor/recommendations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
