export type UserRole = "guest" | "company_owner" | "export_manager" | "finance_staff" | "admin";

export interface UserProfile {
  userId: string;
  firebaseUid?: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string | null;
  companyStatus?: "pending" | "approved" | "rejected" | null;
  status: "active" | "disabled";
  createdAt?: string;
}
