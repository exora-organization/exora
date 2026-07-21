"use client";

import { InvitationPreview } from "../../lib/types/invitation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { AcceptInvitationButton } from "./AcceptInvitationButton";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface InvitationCardProps {
  invite: InvitationPreview;
  token: string;
  isAuthenticated: boolean;
  acceptError: string | null;
}

export function InvitationCard({ invite, token, isAuthenticated, acceptError }: InvitationCardProps) {
  const formatRole = (role: string) => {
    return role.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EBF8F2] p-4 relative overflow-hidden">
      {/* Background Graphic elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A651]/5 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00A651]/5 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3"></div>

      <Card className="w-full max-w-md shadow-xl rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-extrabold text-[#1F2937]">Join {invite.companyName}</CardTitle>
          <CardDescription className="text-base">You have been invited to join the team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-[#EBF8F2] p-5 border-2 border-[#CDEBE0] space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
              <span className="font-bold text-[#4B5563] text-xs uppercase tracking-widest">Invited Email</span>
              <span className="font-semibold text-[#1F2937]">{invite.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
              <span className="font-bold text-[#4B5563] text-xs uppercase tracking-widest">Assigned Role</span>
              <span className="font-semibold text-[#1F2937]">{formatRole(invite.role)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
              <span className="font-bold text-[#4B5563] text-xs uppercase tracking-widest">Expires</span>
              <span className="font-semibold text-[#1F2937]">
                {new Date(invite.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {acceptError && (
             <Alert variant="destructive">
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{acceptError}</AlertDescription>
             </Alert>
          )}

          {isAuthenticated ? (
            <div className="pt-4 text-center">
              <p className="text-sm text-gray-500 animate-pulse">Accepting invitation...</p>
            </div>
          ) : (
            <AcceptInvitationButton token={token} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
