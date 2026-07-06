"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { UserRole } from "../../lib/types/user";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

// RoleGuard is a client-side wrapper that restricts access based on user role.
// It checks the current authenticated actor's role against the provided list of allowed roles.
// If the role is unauthorized, it pushes the routing session to the 403 Forbidden page.
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, loading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthorized roles to /403
    if (!loading && role && !allowedRoles.includes(role)) {
      router.push("/403");
    }
  }, [loading, role, allowedRoles, router]);

  if (loading || (role && !allowedRoles.includes(role))) {
    // Avoid flashing components while performing redirection
    return null; 
  }

  return <>{children}</>;
}
