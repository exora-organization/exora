"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { signOut } from "../../lib/firebase/auth";
import { apiAuth } from "../../lib/api/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await apiAuth.logout().catch(() => {});
    await signOut();
    queryClient.clear();
    router.push("/login");
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogout}
      className="w-full justify-start gap-3 px-5 py-4 rounded-2xl h-auto font-extrabold text-sm uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-md transition-all group"
    >
      <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Sign Out
    </Button>
  );
}
