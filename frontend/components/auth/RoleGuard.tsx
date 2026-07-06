"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { UserRole } from "../../lib/types/user";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, loading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role && !allowedRoles.includes(role)) {
      router.push("/403");
    }
  }, [loading, role, allowedRoles, router]);

  if (loading || (role && !allowedRoles.includes(role))) {
    // Avoid flashing content while redirecting
    return null; 
  }

  return <>{children}</>;
}
