"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyCompanyApprovalsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin-company-applications");
  }, [router]);

  return <div className="p-8 text-center font-bold text-gray-500">Redirecting to Company Applications...</div>;
}
