import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { InvitationPreview, AcceptInvitationResponse } from "../types/invitation";

export const apiInvitations = {
  previewInvitation: async (token: string): Promise<ApiResponse<InvitationPreview>> => {
    return apiClient<ApiResponse<InvitationPreview>>(`/invitations/${token}`, {
      method: "GET",
    });
  },

  acceptInvitation: async (token: string): Promise<ApiResponse<AcceptInvitationResponse>> => {
    return apiClient<ApiResponse<AcceptInvitationResponse>>(`/invitations/${token}/accept`, {
      method: "POST",
    });
  },
};
