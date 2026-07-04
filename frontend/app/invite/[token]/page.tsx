"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInvitations } from "../../../lib/api/invitations";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { LoadingScreen } from "../../../components/auth/LoadingScreen";
import { InvitationStatus } from "../../../components/invitation/InvitationStatus";
import { ExpiredInvitation } from "../../../components/invitation/ExpiredInvitation";
import { InvitationCard } from "../../../components/invitation/InvitationCard";

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading } = useUserProfile();

  const [acceptError, setAcceptError] = useState<string | null>(null);

  // 1. Preview Invitation
  const { data: previewData, isLoading: previewLoading, error: previewError } = useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => apiInvitations.previewInvitation(token),
    retry: false,
  });

  // 2. Accept Mutation
  const acceptMut = useMutation({
    mutationFn: () => apiInvitations.acceptInvitation(token),
    onSuccess: (res) => {
      // Invalidate profile so next fetch gets updated role/company
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      
      const role = res.data?.role;
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "company_owner") {
        router.push("/owner-dashboard");
      } else if (role === "export_manager") {
        router.push("/export-manager-dashboard");
      } else if (role === "finance_staff") {
        router.push("/finance-dashboard");
      } else {
        router.push("/");
      }
    },
    onError: (err: any) => {
      setAcceptError(err.message || "Failed to accept invitation.");
    }
  });

  // 3. Auto-Accept if already logged in and valid invitation
  useEffect(() => {
    if (!authLoading && isAuthenticated && previewData?.data?.status === "pending" && !acceptMut.isPending) {
      acceptMut.mutate();
    }
  }, [authLoading, isAuthenticated, previewData, acceptMut]);

  if (previewLoading || authLoading || acceptMut.isPending) {
    return <LoadingScreen />;
  }

  if (previewError) {
    const errStatus = (previewError as any)?.status;
    if (errStatus === 404) {
      return <InvitationStatus status="invalid" />;
    }
    return <InvitationStatus status="network_error" error={(previewError as any).message} />;
  }

  const invite = previewData?.data;

  if (invite?.status === "accepted") {
    return <InvitationStatus status="accepted" />;
  }

  const isExpired = new Date(invite?.expiresAt || "") < new Date();
  if (isExpired) {
    return <ExpiredInvitation />;
  }

  return (
    <InvitationCard 
      invite={invite!} 
      token={token} 
      isAuthenticated={isAuthenticated} 
      acceptError={acceptError}
    />
  );
}
