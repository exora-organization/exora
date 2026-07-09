import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { DashboardMetrics } from "../types/analytics";

export const apiAnalytics = {
  // Fetch metrics data for the active company tenant or all tenants if user is an admin.
  getDashboard: async (): Promise<ApiResponse<DashboardMetrics>> => {
    return apiClient<ApiResponse<DashboardMetrics>>("/analytics", {
      method: "GET",
    });
  },
};
