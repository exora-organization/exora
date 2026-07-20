"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../../lib/api/export-case";
import { apiPricing } from "../../../../lib/api/pricing";
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Package, CalendarDays, ShieldCheck, TrendingUp } from "lucide-react";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  in_review: { bg: "bg-amber-100", text: "text-amber-800", label: "In Review" },
  finalized: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Finalized" },
};

export default function OwnerExportCaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  if (caseLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
      </div>
    );
  }

  const ec = caseData?.data;
  const pricing = pricingData?.data?.pricing;

  if (!ec) {
    return (
      <div className="text-center py-20 text-[#9CA3AF] font-bold">
        Case not found or access denied.
      </div>
    );
  }

  const status = statusColors[ec.status] || { bg: "bg-gray-100", text: "text-gray-700", label: ec.status };
  const feasPct = ec.feasibilityScore != null ? ec.feasibilityScore * 10 : null;
  const feasLabel = feasPct == null ? "—" : feasPct >= 80 ? "High" : feasPct >= 60 ? "Moderate" : "Low";
  const feasColor = feasPct == null ? "text-gray-400" : feasPct >= 80 ? "text-emerald-700" : feasPct >= 60 ? "text-amber-700" : "text-rose-700";

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Back */}
      <Link href="/export-cases" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00A651] hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Export Cases
      </Link>

      {/* Title */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]">{ec.name}</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-medium">Read-only case overview · No editing available for Company Owner</p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Package className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50", label: "Product", value: ec.product || "—" },
          { icon: <MapPin className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50", label: "Destination", value: ec.destinationCountry },
          { icon: <CalendarDays className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50", label: "Created", value: new Date(ec.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) },
          {
            icon: <ShieldCheck className={`w-5 h-5 ${feasColor}`} />,
            bg: "bg-gray-50",
            label: "Feasibility",
            value: feasPct != null ? `${feasLabel} (${feasPct.toFixed(0)}/100)` : "Not scored",
            valueColor: feasColor,
          },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">{item.label}</p>
              <p className={`text-sm font-black ${(item as any).valueColor || "text-[#1F2937]"}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Summary */}
      {pricing ? (
        <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#00A651]" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1F2937]">Cost & Pricing Summary</h3>
            {pricing.incoterm && (
              <span className="ml-auto px-3 py-1 rounded-lg bg-[#EBF8F2] text-[#00A651] text-xs font-bold uppercase tracking-widest">
                {pricing.incoterm}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Freight", value: `Rp ${pricing.breakdown?.freight?.toLocaleString("id-ID") || "—"}` },
              { label: "Insurance", value: `Rp ${pricing.breakdown?.insurance?.toLocaleString("id-ID") || "—"}` },
              { label: "Total Cost (IDR)", value: `Rp ${pricing.totalCostIDR?.toLocaleString("id-ID") || "—"}` },
              { label: "Selling Price (USD)", value: `$ ${pricing.sellingPriceUSD?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}`, highlight: true },
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl ${item.highlight ? "bg-[#EBF8F2] border border-[#00A651]/20" : "bg-[#F9FAFB] border border-[#E8E3D9]"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${item.highlight ? "text-[#00A651]" : "text-[#9CA3AF]"}`}>{item.label}</p>
                <p className={`text-base font-black ${item.highlight ? "text-[#00A651]" : "text-[#1F2937]"}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-6 text-center text-[#9CA3AF] font-bold text-sm">
          No pricing data available for this case yet.
        </div>
      )}

      {/* Read-only notice */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
        This is a read-only view. Only Export Managers and Finance Staff assigned to this case can edit its details.
      </div>
    </div>
  );
}
