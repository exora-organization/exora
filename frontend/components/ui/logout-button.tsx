"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { signOut } from "../../lib/firebase/auth";
import { apiAuth } from "../../lib/api/auth";

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
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}
