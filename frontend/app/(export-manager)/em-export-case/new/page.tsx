import Link from "next/link";
import { ExportCaseForm } from "../../../../components/export-case/ExportCaseForm";

import { RoleGuard } from "../../../../components/auth/RoleGuard";

export default function NewExportCasePage() {
  return (
    <RoleGuard allowedRoles={["export_manager", "admin"]}>
      <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/em-export-case" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#00A651] hover:bg-[#008F44] transition-all mb-4 px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Export Cases
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">New Export Case</h2>
        <p className="text-sm font-medium text-[#6B7280] mt-1">Fill in the initial details to start analyzing feasibility.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 mt-6">
        <ExportCaseForm />
      </div>
    </div>
    </RoleGuard>
  );
}
