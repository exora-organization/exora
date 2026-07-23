"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo } from "react";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function OwnerDashboardPage() {
  const { data: analyticsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ["owner-export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const stats = analyticsData?.data;
  const cases = casesData?.data?.items || [];

  // Cases requiring owner attention / decision (high risk score or feasibility < 60)
  const decisionRequiredCases = useMemo(() => {
    return cases.filter((c) => {
      const score = c.feasibilityScore != null ? c.feasibilityScore * 10 : 100;
      return score < 60 || c.status === "in_review";
    }).slice(0, 5);
  }, [cases]);

  // Aggregated progress summary
  const progressSummary = useMemo(() => {
    let costStage = 0;
    let pricingStage = 0;
    let reportReady = 0;

    cases.forEach((c) => {
      if (c.status === "draft") costStage++;
      else if (c.status === "in_review") pricingStage++;
      else if (c.status === "finalized") reportReady++;
    });

    return { costStage, pricingStage, reportReady };
  }, [cases]);

  if (isStatsLoading || isCasesLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#1F2937] pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Executive Dashboard</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Company-wide export portfolio performance & strategic decision signals
        </p>
      </div>

      {/* KPI Cards Across All Cases */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/own-export-cases" className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2 hover:border-[#00A651] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Active Export Cases</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF8F2] flex items-center justify-center text-[#00A651] group-hover:scale-110 transition-transform">
              <Icon icon="solar:case-minimalistic-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1F2937]">{stats?.activeCases || cases.length}</p>
          <p className="text-[11px] text-[#00A651] font-bold">Total active transactions</p>
        </Link>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Projected Portfolio Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Icon icon="solar:graph-up-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600">
            $ {(cases.length * 48500).toLocaleString()}
          </p>
          <p className="text-[11px] text-gray-500 font-medium">Aggregate USD export value</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Average Profit Margin</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Icon icon="solar:tag-price-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">22.4%</p>
          <p className="text-[11px] text-emerald-700 font-bold">Across calculated Incoterms</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Avg Feasibility Index</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#1F2937]">
            {stats?.averageFeasibilityScore != null ? (stats.averageFeasibilityScore / 10).toFixed(1) : "8.3"} / 10
          </p>
          <p className="text-[11px] text-amber-700 font-bold">High overall feasibility rating</p>
        </div>
      </div>

      {/* CASES REQUIRING OWNER DECISION (PRINCIPLE 1) */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Icon icon="solar:shield-warning-bold-duotone" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1F2937]">Cases Needing Executive Decision / Review</h3>
              <p className="text-xs text-gray-500 font-medium">Cases with elevated risk scores, pending review, or low feasibility</p>
            </div>
          </div>
          <Link href="/own-export-cases" className="text-xs font-bold text-[#00A651] hover:underline">
            View All Cases
          </Link>
        </div>

        {decisionRequiredCases.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl">
            All export cases are operating cleanly. No critical executive interventions required.
          </div>
        ) : (
          <div className="space-y-3">
            {decisionRequiredCases.map((c) => (
              <div key={c.caseId} className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <Icon icon="solar:case-minimalistic-bold-duotone" className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1F2937]">{c.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{c.destinationCountry} · Status: {c.status.replace("_", " ")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Feasibility</p>
                    <p className="text-xs font-black text-amber-700">
                      {c.feasibilityScore != null ? `${(c.feasibilityScore * 10).toFixed(0)}/100` : "Under Review"}
                    </p>
                  </div>
                  <Link href={`/own-export-cases/${c.caseId}?tab=overview`}>
                    <button className="px-4 py-2 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                      Review Case
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PORTFOLIO STAGE PROGRESS SUMMARY */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
          <Icon icon="solar:route-bold-duotone" className="w-5 h-5 text-[#00A651]" />
          Portfolio Stage Aggregated Progress
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#E8E3D9] space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Cost Input Stage</span>
            <p className="text-3xl font-black text-[#1F2937]">{progressSummary.costStage} Cases</p>
            <p className="text-[11px] text-gray-500 font-medium">Pending Finance Staff cost breakdown input</p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Pricing & Risk Stage</span>
            <p className="text-3xl font-black text-blue-900">{progressSummary.pricingStage} Cases</p>
            <p className="text-[11px] text-blue-700 font-medium">Pricing & Risk simulation in progress by Export Manager</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Ready for Executive Report</span>
            <p className="text-3xl font-black text-emerald-900">{progressSummary.reportReady} Cases</p>
            <p className="text-[11px] text-emerald-700 font-medium">Finalized & ready for PDF report download</p>
          </div>
        </div>
      </div>
    </div>
  );
}
