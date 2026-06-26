"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function AcceptInvitationButton({ token }: { token: string }) {
  const router = useRouter();

  return (
    <div className="pt-4 flex flex-col gap-2">
      <p className="text-sm text-center text-gray-500 mb-2">
        You must login or register to accept this invitation.
      </p>
      <Button onClick={() => router.push(`/login?redirect=/invite/${token}`)} className="w-full">
        Login with Existing Account
      </Button>
      <Button onClick={() => router.push(`/register?redirect=/invite/${token}`)} variant="outline" className="w-full">
        Register New Account
      </Button>
    </div>
  );
}
