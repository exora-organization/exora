import { apiClient } from "./client";
import { UserProfile } from "../types/user";
import { ApiResponse } from "../types/api";

export const apiUsers = {
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>("/users/me", {
      method: "GET",
    });
  },
  
  listUsers: async (): Promise<ApiResponse<{ items: UserProfile[] }>> => {
    return apiClient<ApiResponse<{ items: UserProfile[] }>>("/users", {
      method: "GET",
    });
  },

  updateUser: async (userId: string, data: { status?: "active" | "disabled" }): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  changeRole: async (userId: string, role: string): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>(`/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    return apiClient<ApiResponse<void>>(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};
