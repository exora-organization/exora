export interface ApplicationApplicant {
  userId: string;
  email: string;
}

export interface AdminCompanyApplication {
  companyId: string;
  companyName: string;
  businessSector: string;
  country: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  submittedAt: string;
  applicant: ApplicationApplicant;
}

export interface RejectRequestPayload {
  reason: string;
}

export interface RevisionRequestPayload {
  revisionNotes: string;
}

export interface UserActivityStats {
  loginsLast7Days: number;
  casesCreatedLast7Days: number;
}

export interface MonitoringStats {
  totalCompanies: number;
  totalUsers: number;
  totalExportCases: number;
  pendingApprovals: number;
  activeUsersLast30Days: number;
  aiUsageCount: number;
  userActivityStats: UserActivityStats;
}
