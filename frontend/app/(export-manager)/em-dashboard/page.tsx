"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiCosting } from "../../../lib/api/costing";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { ExportCaseListItem } from "../../../lib/types/export-case";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "in_review", label: "In Review" },
  { key: "finalized", label: "Finalized" },
];

const feasLabel = (score?: number | null) => {
  if (score == null) return null;
  const pct = score * 10;
  if (pct >= 80) return { label: "High", color: "text-emerald-700", bg: "bg-emerald-100" };
  if (pct >= 60) return { label: "Moderate", color: "text-amber-700", bg: "bg-amber-100" };
  return { label: "Low", color: "text-rose-700", bg: "bg-rose-100" };
};

// Per-case pending action checker fetches costing data lazily
function CaseRow({ c }: { c: ExportCaseListItem }) {
  const { data: costData } = useQuery({
    queryKey: ["cost-data", c.caseId],
    queryFn: () => apiCosting.getCostData(c.caseId),
    retry: false,
    staleTime: 60_000,
  });

  const hasCostData = !!costData?.data?.hpp;
  const pendingAction = !hasCostData ? "Costing not yet completed by Finance" : null;
  const feas = feasLabel(c.feasibilityScore);
  const feasPct = c.feasibilityScore != null ? (c.feasibilityScore * 10).toFixed(0) : null;

  return (
    <Link
      href={`/em-export-case/${c.caseId}`}
      className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-[#E8E3D9] bg-white/60 hover:bg-white hover:shadow-lg transition-all gap-4 group"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0 mt-0.5">
          <Icon icon="solar:case-minimalistic-bold-duotone" className="w-4 h-4 text-[#00A651]" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-[#1F2937] text-sm truncate group-hover:text-[#00A651] transition-colors">
            {c.name}
          </p>
          <p className="text-xs text-[#9CA3AF] font-medium mt-0.5">
            {c.destinationCountry} · {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
          {pendingAction && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-amber-700">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-3 h-3 shrink-0" />
              {pendingAction}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap shrink-0">
        {/* Feasibility Badge */}
        {feas ? (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${feas.bg} ${feas.color}`}>
            {feas.label} · {feasPct}/100
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
            No Score
          </span>
        )}
        {/* Status Badge */}
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
          c.status === "finalized" ? "bg-emerald-100 text-emerald-800" :
          c.status === "in_review" ? "bg-amber-100 text-amber-800" :
          "bg-gray-100 text-gray-700"
        }`}>
          {c.status.replace("_", " ")}
        </span>
        <div className="ml-2">
          <span className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl py-1.5 px-3 text-[10px] shadow-sm">
            View Detail
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ExportManagerDashboardPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: casesData, isLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const allCases = casesData?.data?.items || [];

  const filtered = useMemo(() => {
    if (statusFilter === "all") return allCases;
    return allCases.filter(c => c.status === statusFilter);
  }, [allCases, statusFilter]);

  const counts = useMemo(() => ({
    total: allCases.length,
    active: allCases.filter(c => c.status === "in_review").length,
    draft: allCases.filter(c => c.status === "draft").length,
    finalized: allCases.filter(c => c.status === "finalized").length,
  }), [allCases]);

  const avgFeasibility = useMemo(() => {
    const scored = allCases.filter(c => c.feasibilityScore != null);
    if (!scored.length) return null;
    return scored.reduce((sum, c) => sum + (c.feasibilityScore! * 10), 0) / scored.length;
  }, [allCases]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 text-[#1F2937] pb-10 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Export Manager Dashboard</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">Case-centric working view for your export pipeline</p>
        </div>
        <div className="flex gap-3">
          <Link href="/em-export-case">
            <button className="px-5 py-2.5 rounded-xl border border-[#E8E3D9] bg-white text-sm font-bold text-[#4B5563] hover:shadow-md transition-all">
              View All Cases
            </button>
          </Link>
          <Link href="/em-export-case/new">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Icon icon="solar:add-circle-bold-duotone" className="w-4 h-4" /> New Case
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Cases", value: counts.total, icon: <Icon icon="solar:case-minimalistic-bold-duotone" className="w-4 h-4 text-[#00A651]" />, bg: "bg-[#EBF8F2]", dot: "bg-[#00A651]", subtitle: "All export cases" },
          { label: "In Review", value: counts.active, icon: <Icon icon="solar:clock-circle-bold-duotone" className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50", dot: "bg-amber-500", subtitle: "Active pipeline" },
          { label: "Draft", value: counts.draft, icon: <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-500" />, bg: "bg-gray-100", dot: "bg-gray-500", subtitle: "Incomplete cases" },
          { label: "Avg Feasibility", value: avgFeasibility != null ? `${avgFeasibility.toFixed(0)}/100` : "—", icon: <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50", dot: "bg-blue-500", subtitle: "Overall score" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">{kpi.label}</h3>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>{kpi.icon}</div>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <div className="text-4xl font-extrabold text-[#1F2937]">{kpi.value}</div>
            </div>
            <div className="flex items-center text-xs font-semibold text-[#4B5563]">
              <span className={`w-2 h-2 rounded-full ${kpi.dot} mr-2 shrink-0`}></span>
              {kpi.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Cases Section with Status Filter */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
            My Export Cases
          </h3>
          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === f.key
                    ? "bg-[#00A651] text-white shadow-md"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E8E3D9]"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                  statusFilter === f.key ? "bg-white/20 text-white" : "bg-white text-[#9CA3AF]"
                }`}>
                  {f.key === "all" ? allCases.length :
                   f.key === "draft" ? counts.draft :
                   f.key === "in_review" ? counts.active :
                   counts.finalized}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#9CA3AF] font-bold">
              No cases match this filter.
            </div>
          ) : (
            filtered.map(c => <CaseRow key={c.caseId} c={c} />)
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-5 flex justify-end">
            <Link href="/em-export-case" className="text-xs font-bold text-[#00A651] hover:underline flex items-center gap-1">
              View all cases <Icon icon="solar:arrow-right-bold-duotone" className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
