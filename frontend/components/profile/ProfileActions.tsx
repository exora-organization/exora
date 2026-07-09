"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { LogOut, KeyRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signOut, resetPassword } from "../../lib/firebase/auth";
import { apiAuth } from "../../lib/api/auth";

interface ProfileActionsProps {
  email: string;
}

export function ProfileActions({ email }: ProfileActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      await apiAuth.logout().catch(() => {});
      queryClient.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      console.error("Failed to send reset email", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <Button 
        variant="outline" 
        className="flex-1 text-slate-700" 
        onClick={handleResetPassword}
        disabled={isResetting || resetSent}
      >
        <KeyRound className="w-4 h-4 mr-2" />
        {resetSent ? "Reset Email Sent!" : "Reset Password"}
      </Button>
      <Button 
        variant="destructive" 
        className="flex-1" 
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
