export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt?: string;
}

export interface InvitationListItem {
  invitationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

export interface InviteRequestPayload {
  email: string;
  role: "export_manager" | "finance_staff";
}

export interface CompanyDetailResponse {
  companyId: string;
  companyName: string;
  businessSector: string;
  country: string;
  status: string;
  approvedAt?: string;
  ownerUserId: string;
  ownerRole: string;
}

export interface ResendRequestPayload {
  invitationId: string;
}
