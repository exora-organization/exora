import { apiClient } from "./client";
import { UserProfile } from "../types/user";
import { ApiResponse } from "../types/api";

export const apiUsers = {
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    return apiClient<ApiResponse<UserProfile>>("/users/me", {
      method: "GET",
    });
  },
};
