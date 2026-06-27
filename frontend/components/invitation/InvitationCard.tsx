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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-600">Join {invite.companyName}</CardTitle>
          <CardDescription>You have been invited to join the team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 border space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Invited Email</span>
              <span className="font-medium text-slate-900">{invite.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Assigned Role</span>
              <span className="font-medium text-slate-900">{formatRole(invite.role)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Expires</span>
              <span className="font-medium text-slate-900">
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
