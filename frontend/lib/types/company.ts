export interface CompanyApplicationRequest {
  companyName: string;
  businessSector: string;
  country: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected" | "revision_requested";

export interface CompanyApplicationResponse {
  applicationId: string;
  companyName: string;
  businessSector: string;
  country: string;
  status: ApplicationStatus;
  revisionNotes?: string;
  submittedAt: string;
  updatedAt: string;
}
