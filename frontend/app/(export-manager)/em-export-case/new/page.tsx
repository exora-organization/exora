import Link from "next/link";
import { ExportCaseForm } from "../../../../components/export-case/ExportCaseForm";

import { RoleGuard } from "../../../../components/auth/RoleGuard";

export default function NewExportCasePage() {
  return (
    <RoleGuard allowedRoles={["export_manager", "admin"]}>
      <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/em-export-case" className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Export Cases
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">New Export Case</h2>
        <p className="text-[#9CA3AF] mt-1">Fill in the initial details to start analyzing feasibility.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 mt-6">
        <ExportCaseForm />
      </div>
    </div>
    </RoleGuard>
  );
}
