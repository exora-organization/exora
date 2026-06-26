import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { CompanyApplicationRequest, CompanyApplicationResponse } from "../types/company";

export const apiCompany = {
  apply: async (data: CompanyApplicationRequest): Promise<ApiResponse<CompanyApplicationResponse>> => {
    return apiClient<ApiResponse<CompanyApplicationResponse>>("/companies/apply", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  getApplicationStatus: async (): Promise<ApiResponse<CompanyApplicationResponse>> => {
    return apiClient<ApiResponse<CompanyApplicationResponse>>("/companies/application-status", {
      method: "GET",
    });
  },
};
