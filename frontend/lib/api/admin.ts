import { apiClient } from "./client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { AdminCompanyApplication, RejectRequestPayload, RevisionRequestPayload } from "../types/admin";

export const apiAdmin = {
  getCompanyApplications: async (): Promise<ApiResponse<PaginatedResponse<AdminCompanyApplication>>> => {
    return apiClient<ApiResponse<PaginatedResponse<AdminCompanyApplication>>>("/admin/company-applications", {
      method: "GET",
    });
  },
  
  approveCompany: async (companyId: string): Promise<ApiResponse<void>> => {
    return apiClient<ApiResponse<void>>(`/admin/company-applications/${companyId}/approve`, {
      method: "POST",
    });
  },
  
  rejectCompany: async (companyId: string, payload: RejectRequestPayload): Promise<ApiResponse<void>> => {
    return apiClient<ApiResponse<void>>(`/admin/company-applications/${companyId}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  
  requestRevision: async (companyId: string, payload: RevisionRequestPayload): Promise<ApiResponse<void>> => {
    return apiClient<ApiResponse<void>>(`/admin/company-applications/${companyId}/request-revision`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
