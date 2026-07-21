"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";

export function AcceptInvitationButton({ token }: { token: string }) {
  const router = useRouter();

  return (
    <div className="pt-6 flex flex-col gap-3">
      <p className="text-sm font-semibold text-center text-[#4B5563] mb-2">
        You must login or register to accept this invitation.
      </p>
      <Button onClick={() => router.push(`/login?redirect=/invite/${token}`)} className="bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full h-auto flex items-center justify-center gap-2">
        <Icon icon="solar:login-2-bold-duotone" className="w-5 h-5" />
        Login with Existing Account
      </Button>
      <Button onClick={() => router.push(`/register?redirect=/invite/${token}`)} variant="outline" className="rounded-full font-bold px-8 py-4 text-[#4B5563] border-2 border-[#E5E7EB] hover:bg-gray-50 hover:text-[#1F2937] w-full h-auto transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
        <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5" />
        Register New Account
      </Button>
    </div>
  );
}
