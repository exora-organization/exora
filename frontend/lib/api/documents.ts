import { apiClient } from "./client";
import { ApiResponse } from "../types/api";
import { DocumentListResponse, GenerateDocumentResponse } from "../types/documents";

export const apiDocuments = {
  listDocuments: async (caseId: string): Promise<ApiResponse<DocumentListResponse>> => {
    return apiClient<ApiResponse<DocumentListResponse>>(`/export-cases/${caseId}/documents`, {
      method: "GET",
    });
  },

  generateQuotation: async (caseId: string): Promise<ApiResponse<GenerateDocumentResponse>> => {
    return apiClient<ApiResponse<GenerateDocumentResponse>>(`/export-cases/${caseId}/documents/quotation`, {
      method: "POST",
    });
  },

  generateProformaInvoice: async (caseId: string): Promise<ApiResponse<GenerateDocumentResponse>> => {
    return apiClient<ApiResponse<GenerateDocumentResponse>>(`/export-cases/${caseId}/documents/proforma-invoice`, {
      method: "POST",
    });
  },

  generateCostBreakdown: async (caseId: string): Promise<ApiResponse<GenerateDocumentResponse>> => {
    return apiClient<ApiResponse<GenerateDocumentResponse>>(`/export-cases/${caseId}/documents/cost-breakdown-report`, {
      method: "POST",
    });
  },

  generateFeasibility: async (caseId: string): Promise<ApiResponse<GenerateDocumentResponse>> => {
    return apiClient<ApiResponse<GenerateDocumentResponse>>(`/export-cases/${caseId}/documents/feasibility-report`, {
      method: "POST",
    });
  },

  getDownloadUrl: async (documentId: string): Promise<ApiResponse<{documentId: string, filename: string, downloadUrl: string}>> => {
    return apiClient<ApiResponse<{documentId: string, filename: string, downloadUrl: string}>>(`/documents/${documentId}/download`, {
      method: "GET",
    });
  }
};

