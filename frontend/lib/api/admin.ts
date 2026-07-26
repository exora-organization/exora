import { apiClient } from "./client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import { AdminCompanyApplication, RejectRequestPayload, RevisionRequestPayload, MonitoringStats, AuditLogResponse } from "../types/admin";
import { ProfileChangeResponse } from "../types/company";

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

  getCompanyChangeRequests: async (): Promise<ApiResponse<{ items: ProfileChangeResponse[] }>> => {
    return apiClient<ApiResponse<{ items: ProfileChangeResponse[] }>>("/admin/company-change-requests", {
      method: "GET",
    });
  },

  approveChangeRequest: async (requestId: string): Promise<ApiResponse<ProfileChangeResponse>> => {
    return apiClient<ApiResponse<ProfileChangeResponse>>(`/admin/company-change-requests/${requestId}/approve`, {
      method: "POST",
    });
  },

  rejectChangeRequest: async (requestId: string, reason: string): Promise<ApiResponse<ProfileChangeResponse>> => {
    return apiClient<ApiResponse<ProfileChangeResponse>>(`/admin/company-change-requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
  
  getMonitoring: async (): Promise<ApiResponse<MonitoringStats>> => {
    return apiClient<ApiResponse<MonitoringStats>>(`/admin/monitoring`, {
      method: "GET",
    });
  },

  getAuditLogs: async (limit: number = 100): Promise<ApiResponse<AuditLogResponse>> => {
    return apiClient<ApiResponse<AuditLogResponse>>(`/admin/audit-logs?limit=${limit}`, {
      method: "GET",
    });
  },
};

