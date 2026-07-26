import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { CompanyApplicationRequest, CompanyApplicationResponse, ProfileChangePayload, ProfileChangeResponse } from "../types/company";

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

  getCompany: async (companyId: string): Promise<ApiResponse<CompanyApplicationResponse>> => {
    return apiClient<ApiResponse<CompanyApplicationResponse>>(`/companies/${companyId}`, {
      method: "GET",
    });
  },

  requestChange: async (companyId: string, data: ProfileChangePayload): Promise<ApiResponse<ProfileChangeResponse>> => {
    return apiClient<ApiResponse<ProfileChangeResponse>>(`/companies/${companyId}/change-request`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getPendingChangeRequest: async (companyId: string): Promise<ApiResponse<ProfileChangeResponse>> => {
    return apiClient<ApiResponse<ProfileChangeResponse>>(`/companies/${companyId}/change-request`, {
      method: "GET",
    });
  },
};

