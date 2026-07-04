export interface InvitationPreview {
  email: string;
  role: string;
  companyName: string;
  status: string;
  expiresAt: string;
}

export interface AcceptInvitationResponse {
  userId: string;
  role: string;
  companyId: string;
  invitationStatus: string;
}
