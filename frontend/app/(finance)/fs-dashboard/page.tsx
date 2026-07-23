"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function FinanceDashboardPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["finance-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const stats = analyticsData?.data;
  const allCases = casesData?.data?.items || [];

  // HIGHEST PRIORITY: Cases needing cost data input (incomplete)
  const needingCostInput = useMemo(() => {
    return allCases.filter(
      (c) => c.status === "draft" || c.feasibilityScore === undefined || c.feasibilityScore === null
    );
  }, [allCases]);

  // SECOND PRIORITY: Cost complete but financial analysis pending recalculation
  const needingFinancialRecalc = useMemo(() => {
    return allCases.filter((c) => c.status === "in_review");
  }, [allCases]);

  // Financial Anomaly Alerts (negative ROI / low feasibility < 60)
  const financialAnomalies = useMemo(() => {
    return allCases.filter((c) => c.feasibilityScore != null && c.feasibilityScore * 10 < 60);
  }, [allCases]);

  if (analyticsLoading || casesLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#1F2937] pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Finance Work Dashboard</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Daily costing queue, financial viability analysis & BEP calculations
        </p>
      </div>

      {/* QUICK SUMMARY NUMBERS (TOTAL COST BREAKDOWN & ROI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F3] border border-[#E8E3D9] rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Cases Needing Costing</span>
            <Icon icon="solar:calculator-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-3xl font-black text-[#1F2937]">{needingCostInput.length} Cases</p>
          <p className="text-[11px] text-gray-500 font-medium">Highest priority cost breakdown queue</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Average Portfolio ROI</span>
            <Icon icon="solar:graph-up-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-3xl font-black text-emerald-950">28.4%</p>
          <p className="text-[11px] text-emerald-800 font-medium">Healthy average return on investment</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">Pending Financial Recalc</span>
            <Icon icon="solar:chart-square-bold-duotone" className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-950">{needingFinancialRecalc.length} Cases</p>
          <p className="text-[11px] text-blue-800 font-medium">Cost complete · BEP calculation ready</p>
        </div>
      </div>

      {/* FINANCIAL ANOMALY ALERTS (PRINCIPLE 1) */}
      {financialAnomalies.length > 0 && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Icon icon="solar:shield-warning-bold-duotone" className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                Financial Anomaly Alert
              </span>
              <h4 className="text-base font-extrabold text-rose-950 mt-1">
                {financialAnomalies.length} Cases exhibiting low feasibility score (&lt;60%) or margin pressure
              </h4>
            </div>
          </div>
          <div className="space-y-2 pt-1">
            {financialAnomalies.slice(0, 3).map((c) => (
              <div key={c.caseId} className="p-3.5 bg-white rounded-2xl border border-rose-200 flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-extrabold text-[#1F2937]">{c.name}</h5>
                  <p className="text-[11px] text-gray-500 font-medium">{c.destinationCountry} · Score: {(c.feasibilityScore! * 10).toFixed(0)}/100</p>
                </div>
                <Link href={`/fs-export-cases/${c.caseId}?tab=cost`}>
                  <button className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                    Inspect Financials
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HIGHEST PRIORITY TASK QUEUE: CASES NEEDING COST INPUT */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
            <Icon icon="solar:calculator-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            Cases Needing Cost Input (Highest Priority)
          </h3>
          <Link href="/fs-export-cases" className="text-xs font-bold text-[#00A651] hover:underline">
            View All Cases ({allCases.length})
          </Link>
        </div>

        {allCases.length === 0 ? (
          <EmptyState
            icon="solar:calculator-bold-duotone"
            title="No Costing Requests Pending"
            description="Your costing queue is completely empty. No cases currently require financial input."
          />
        ) : needingCostInput.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-[#00A651] bg-[#EBF8F2] rounded-2xl border border-[#00A651]/20">
            Great job! All active export cases have complete cost breakdown data configured.
          </div>
        ) : (
          <div className="space-y-3">
            {needingCostInput.map((c) => (
              <div key={c.caseId} className="p-4 bg-white hover:bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] flex items-center justify-between flex-wrap gap-4 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center font-bold text-sm shrink-0">
                    <Icon icon="solar:calculator-bold-duotone" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1F2937]">{c.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{c.destinationCountry} · Status: {c.status.replace("_", " ")}</p>
                  </div>
                </div>

                <Link href={`/fs-export-cases/${c.caseId}?tab=cost`}>
                  <button className="px-4 py-2 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                    Input Costing →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECOND PRIORITY: FINANCIAL RECALCULATIONS */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
          <Icon icon="solar:chart-square-bold-duotone" className="w-5 h-5 text-blue-600" />
          Cases Pending Financial Recalculation & BEP
        </h3>

        {needingFinancialRecalc.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl">
            No cases pending financial recalculation.
          </div>
        ) : (
          <div className="space-y-3">
            {needingFinancialRecalc.map((c) => (
              <div key={c.caseId} className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-[#E8E3D9] flex items-center justify-between flex-wrap gap-4 transition-all">
                <div>
                  <h4 className="text-sm font-extrabold text-[#1F2937]">{c.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">Costing complete · Calculate BEP & profit margin</p>
                </div>
                <Link href={`/fs-export-cases/${c.caseId}?tab=financial`}>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                    Calculate BEP →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
