"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LegacyCompanyApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;

  useEffect(() => {
    if (companyId) {
      router.replace(`/admin-company-applications/${companyId}`);
    } else {
      router.replace("/admin-company-applications");
    }
  }, [companyId, router]);

  return <div className="p-8 text-center font-bold text-gray-500">Redirecting to Application Details...</div>;
}
