"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiCosting } from "../../../../../lib/api/costing";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { Icon } from "@iconify/react";

const COST_FIELDS: { key: keyof import("../../../../../lib/types/costing").CostDataResponse; label: string; prefix?: string; suffix?: string }[] = [
  { key: "hpp", label: "Cost of Goods (HPP)", prefix: "Rp" },
  { key: "packaging", label: "Packaging", prefix: "Rp" },
  { key: "certification", label: "Certification", prefix: "Rp" },
  { key: "transportation", label: "Transportation (Domestic)", prefix: "Rp" },
  { key: "freight", label: "Freight", prefix: "Rp" },
  { key: "insurance", label: "Insurance", prefix: "Rp" },
  { key: "exchangeRate", label: "Exchange Rate (IDR/USD)", prefix: "Rp" },
  { key: "targetMargin", label: "Target Margin", suffix: "%" },
  { key: "quantity", label: "Quantity", suffix: "units" },
  { key: "paymentTerm", label: "Payment Term" },
];

export default function EMCostBreakdownDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: costData, isLoading: costLoading, error: costError } = useQuery({
    queryKey: ["cost-data", caseId],
    queryFn: () => apiCosting.getCostData(caseId),
    retry: false,
  });

  if (caseLoading || costLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  const exportCase = caseData?.data;
  const cost = costData?.data;
  const costMissing = !cost?.hpp || costError;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <Link href={`/em-export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all mb-5">
        <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]">Cost Breakdown</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-medium">
            {exportCase?.name} · {exportCase?.destinationCountry}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700">
          <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-blue-500" />
          Read-only
        </div>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        Cost data is entered and managed by Finance Staff. Export Managers have read-only access to view cost components.
      </div>

      {costMissing ? (
        <div className="flex flex-col items-center gap-4 p-10 bg-white/90 backdrop-blur-xl border border-amber-200 shadow-xl rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-full opacity-50 -z-10" />
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-12 h-12 text-amber-500" />
          <div>
            <p className="text-lg font-extrabold text-amber-900 mb-1">Costing not yet completed by Finance</p>
            <p className="text-sm text-amber-700 font-semibold">
              Finance Staff have not yet entered cost data for this case. Check back once they have configured the costing sheet.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl overflow-hidden">
          <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-4">
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">
              Cost Components Incoterm: {cost?.paymentTerm}
            </p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {COST_FIELDS.map(({ key, label, prefix, suffix }) => {
              const raw = cost?.[key];
              if (raw === undefined || raw === null) return null;
              const formatted =
                typeof raw === "number"
                  ? `${prefix ?? ""}${raw.toLocaleString("id-ID")}${suffix ? " " + suffix : ""}`
                  : String(raw);
              return (
                <div key={key} className="flex justify-between items-center px-6 py-4 hover:bg-[#FAFCFB] transition-colors">
                  <span className="text-sm font-bold text-[#4B5563]">{label}</span>
                  <span className="text-sm font-black text-[#1F2937]">{formatted}</span>
                </div>
              );
            })}
          </div>
          {cost?.updatedAt && (
            <div className="px-6 py-3 bg-[#F9FAFB] border-t border-[#E8E3D9] text-xs text-[#9CA3AF] font-bold">
              Last updated by Finance: {new Date(cost.updatedAt).toLocaleString("id-ID")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
