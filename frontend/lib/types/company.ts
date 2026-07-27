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
  rejectReason?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface CompanyData {
  companyName: string;
  businessSector: string;
  country: string;
}

export interface ProfileChangePayload {
  companyName: string;
  businessSector: string;
  country: string;
  reason?: string;
}

export interface ProfileChangeResponse {
  id: string;
  companyId: string;
  applicantUserId: string;
  before: CompanyData;
  after: CompanyData;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  requestedAt: string;
  processedAt?: string;
}

