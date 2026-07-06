"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import { LoadingScreen } from "../components/auth/LoadingScreen";

export default function Home() {
  const { role, profile, loading, isAuthenticated } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "company_owner") {
        router.push("/owner-dashboard");
      } else if (role === "export_manager") {
        router.push("/export-manager-dashboard");
      } else if (role === "finance_staff") {
        router.push("/finance-dashboard");
      } else {
        if (profile?.companyId || profile?.companyStatus) {
          router.push("/application-status");
        } else {
          router.push("/company-application");
        }
      }
    } else if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [role, profile, loading, isAuthenticated, router]);

  return <LoadingScreen />;
}
