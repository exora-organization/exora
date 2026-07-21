import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { SaveCostDataRequest, CostDataResponse } from "../types/costing";

export const apiCosting = {
  getCostData: async (caseId: string): Promise<ApiResponse<CostDataResponse>> => {
    return apiClient<ApiResponse<CostDataResponse>>(`/own-export-cases/${caseId}/cost-data`, {
      method: "GET",
    });
  },

  saveCostData: async (caseId: string, data: SaveCostDataRequest): Promise<ApiResponse<CostDataResponse>> => {
    return apiClient<ApiResponse<CostDataResponse>>(`/own-export-cases/${caseId}/cost-data`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
