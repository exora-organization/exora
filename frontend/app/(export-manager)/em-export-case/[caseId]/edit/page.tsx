"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { ExportCaseForm } from "../../../../../components/export-case/ExportCaseForm";
import { RoleGuard } from "../../../../../components/auth/RoleGuard";
import { Icon } from "@iconify/react";

export default function EditExportCasePage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
      </div>
    );
  }

  const exportCase = caseData?.data;

  if (!exportCase) {
    return (
      <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl mt-10">
        Export Case not found or you don't have permission to access it.
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["export_manager", "admin"]}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <Link href="/em-export-case" className="inline-flex items-center gap-2 text-[13px] font-bold text-white bg-[#00A651] hover:bg-[#008F44] transition-all mb-4 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Export Cases
          </Link>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Edit Export Case</h2>
          <p className="text-sm font-medium text-[#6B7280] mt-1">Update the details of this export case.</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 mt-6">
          <ExportCaseForm initialData={exportCase} isEdit={true} />
        </div>
      </div>
    </RoleGuard>
  );
}
