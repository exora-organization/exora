import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { CreateScenarioRequest, CreateScenarioResponse, ListScenariosResponse, ComparisonResponse } from "../types/scenario";

export const apiScenario = {
  create: async (caseId: string, data: CreateScenarioRequest): Promise<ApiResponse<CreateScenarioResponse>> => {
    return apiClient<ApiResponse<CreateScenarioResponse>>(`/export-cases/${caseId}/scenarios`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  list: async (caseId: string): Promise<ApiResponse<ListScenariosResponse>> => {
    return apiClient<ApiResponse<ListScenariosResponse>>(`/export-cases/${caseId}/scenarios/compare`, {
      method: "GET",
    });
  },

  compare: async (caseId: string, scenarioIds: string[]): Promise<ApiResponse<ComparisonResponse>> => {
    const ids = scenarioIds.join(",");
    return apiClient<ApiResponse<ComparisonResponse>>(`/export-cases/${caseId}/scenarios/compare?scenarioIds=${ids}`, {
      method: "GET",
    });
  },
};
