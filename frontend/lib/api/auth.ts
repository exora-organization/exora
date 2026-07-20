import { apiClient } from "./client";
import { UserProfile } from "../types/user";
import { ApiResponse } from "../types/api";

export const apiAuth = {
  login: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>("/auth/login", {
      method: "POST",
    });
  },
  register: async (displayName: string, recaptchaToken?: string): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ displayName, recaptchaToken }),
    });
  },
  logout: async (): Promise<ApiResponse<{ loggedOut: boolean }>> => {
    return apiClient<ApiResponse<{ loggedOut: boolean }>>("/auth/logout", {
      method: "POST",
    });
  },
};
