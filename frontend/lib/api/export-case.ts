import { apiClient } from "./client";
import { ApiResponse, PaginatedResponse } from "../types/api";
import {
  ExportCaseListItem,
  ExportCaseResponse,
  CreateExportCaseRequest,
  UpdateExportCaseRequest,
} from "../types/export-case";

export const apiExportCase = {
  list: async (): Promise<ApiResponse<PaginatedResponse<ExportCaseListItem>>> => {
    return apiClient<ApiResponse<PaginatedResponse<ExportCaseListItem>>>("/export-cases", {
      method: "GET",
    });
  },

  get: async (caseId: string): Promise<ApiResponse<ExportCaseResponse>> => {
    return apiClient<ApiResponse<ExportCaseResponse>>(`/export-cases/${caseId}`, {
      method: "GET",
    });
  },

  create: async (data: CreateExportCaseRequest): Promise<ApiResponse<ExportCaseResponse>> => {
    return apiClient<ApiResponse<ExportCaseResponse>>("/export-cases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (caseId: string, data: UpdateExportCaseRequest): Promise<ApiResponse<ExportCaseResponse>> => {
    return apiClient<ApiResponse<ExportCaseResponse>>(`/export-cases/${caseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (caseId: string): Promise<ApiResponse<void>> => {
    return apiClient<ApiResponse<void>>(`/export-cases/${caseId}`, {
      method: "DELETE",
    });
  },
};
