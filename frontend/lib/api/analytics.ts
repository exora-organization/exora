import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { DashboardMetrics } from "../types/analytics";

export const apiAnalytics = {
  getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
    return apiClient<ApiResponse<DashboardMetrics>>("/analytics", {
      method: "GET",
    });
  },
};
