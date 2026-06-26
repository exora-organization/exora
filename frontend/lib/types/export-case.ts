export interface ExportCaseListItem {
  caseId: string;
  companyId: string;
  name: string;
  destinationCountry: string;
  status: string;
  feasibilityScore?: number;
  createdAt: string;
}

export interface ExportCaseResponse {
  caseId: string;
  companyId: string;
  name: string;
  product?: string;
  destinationCountry: string;
  status: string;
  feasibilityScore?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExportCaseRequest {
  name: string;
  product: string;
  destinationCountry: string;
}

export interface UpdateExportCaseRequest {
  name?: string;
  product?: string;
  destinationCountry?: string;
  status?: "draft" | "in_review" | "finalized";
  feasibilityScore?: number;
}
