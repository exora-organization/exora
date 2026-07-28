"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { apiExportCase } from "../../../../lib/api/export-case";
import { CaseSubNav } from "../../../../components/export-case/CaseSubNav";

export default function CaseDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const caseId = params.caseId as string;

  const { data: caseData } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const exportCase = caseData?.data;

  // Derive active tab from pathname or query (for sub-page routes like /pricing, /risk, etc.)
  const pathSegments = pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const queryTab = searchParams.get("tab");
  const subPageTabs = ["pricing", "scenario", "risk", "financial"];

  let activeTab = "overview";
  if (subPageTabs.includes(lastSegment)) {
    activeTab = lastSegment;
  } else if (queryTab) {
    activeTab = queryTab === "costing" ? "cost" : queryTab;
  }

  const handleTabChange = (tabId: string) => {
    if (tabId === "pricing" || tabId === "scenario" || tabId === "risk" || tabId === "financial") {
      router.push(`/em-export-case/${caseId}/${tabId}`);
    } else {
      router.push(`/em-export-case/${caseId}?tab=${tabId}`);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link
        href="/em-export-case"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-md shadow-[#00A651]/20 transition-all"
      >
        <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" />
        Back to Export Cases
      </Link>

      {/* Case Header */}
      {exportCase && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">{exportCase.name}</h2>
            <p className="text-xs text-[#6B7280] mt-1 font-medium">Export Manager Workspace · EXORA Tenant Pro</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border ${
            exportCase.status === "finalized" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            exportCase.status === "in_review" ? "bg-amber-50 text-amber-800 border-amber-200" :
            "bg-gray-50 text-gray-700 border-gray-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              exportCase.status === "finalized" ? "bg-emerald-500" :
              exportCase.status === "in_review" ? "bg-amber-500" :
              "bg-gray-500"
            }`}></span>
            {exportCase.status.replace("_", " ")}
          </span>
        </div>
      )}

      {/* Shared Sub Navigation Tabs */}
      <CaseSubNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Page Content */}
      {children}
    </div>
  );
}
