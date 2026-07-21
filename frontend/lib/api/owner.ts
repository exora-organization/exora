import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { 
  TeamMember, 
  InvitationListItem, 
  InviteRequestPayload, 
  CompanyDetailResponse,
  ResendRequestPayload
} from "../types/owner";

export const apiOwner = {
  getCompanyDetails: async (companyId: string): Promise<ApiResponse<CompanyDetailResponse>> => {
    return apiClient<ApiResponse<CompanyDetailResponse>>(`/companies/${companyId}`, {
      method: "GET",
    });
  },

  getTeamMembers: async (): Promise<ApiResponse<{ items: TeamMember[] }>> => {
    return apiClient<ApiResponse<{ items: TeamMember[] }>>("/admin-users", {
      method: "GET",
    });
  },

  getInvitations: async (): Promise<ApiResponse<{ items: InvitationListItem[] }>> => {
    return apiClient<ApiResponse<{ items: InvitationListItem[] }>>("/invitations", {
      method: "GET",
    });
  },

  inviteMember: async (data: InviteRequestPayload): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>("/users/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resendInvitation: async (data: ResendRequestPayload): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>("/invitations/resend", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMember: async (userId: string, data: { displayName?: string; status?: string }): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>(`/admin-users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  changeRole: async (userId: string, role: string): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>(`/admin-users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  removeMember: async (userId: string): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>(`/admin-users/${userId}`, {
      method: "DELETE",
    });
  },

  deleteInvitation: async (invitationId: string): Promise<ApiResponse<any>> => {
    return apiClient<ApiResponse<any>>(`/invitations/${invitationId}`, {
      method: "DELETE",
    });
  },
};
