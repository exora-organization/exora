"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

function BarRow({ label, value, total, colorClass }: { label: string; value: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-[#4B5563]">{label}</span>
        <span className="text-[#1F2937]">{value} <span className="text-[#9CA3AF] font-medium">({pct}%)</span></span>
      </div>
      <div className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function OwnerAnalyticsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["owner-export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const stats = statsData?.data;
  const cases = casesData?.data?.items || [];

  const feasDist = useMemo(() => {
    let high = 0, moderate = 0, low = 0;
    cases.forEach((c) => {
      const pct = c.feasibilityScore != null ? c.feasibilityScore * 10 : 0;
      if (pct >= 80) high++;
      else if (pct >= 60) moderate++;
      else if (pct > 0) low++;
    });
    return { high, moderate, low, total: high + moderate + low };
  }, [cases]);

  const riskDist = stats?.riskSummary;
  const riskTotal = riskDist ? riskDist.low + riskDist.medium + riskDist.high : 0;

  const fmtIDR = (v?: number | null) =>
    v != null ? `Rp ${Math.round(v).toLocaleString("id-ID")}` : "—";

  const fmtPct = (v?: number | null) =>
    v != null ? `${v.toFixed(1)}%` : "—";

  if (statsLoading || casesLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Analytics</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-medium">
          Company-wide financial performance, risk exposure, and feasibility distribution
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          {
            icon: <Icon icon="solar:dollar-bold-duotone" className="w-6 h-6 text-emerald-600" />,
            bg: "bg-emerald-50",
            label: "Total Export Value",
            value: fmtIDR(stats?.totalExportValue),
          },
          {
            icon: <Icon icon="solar:graph-up-bold-duotone" className="w-6 h-6 text-blue-500" />,
            bg: "bg-blue-50",
            label: "Estimated Gross Margin",
            value: fmtPct(stats?.estGrossMargin),
          },
          {
            icon: <Icon icon="solar:chart-square-bold-duotone" className="w-6 h-6 text-green-500" />,
            bg: "bg-green-50",
            label: "Total Freight Cost",
            value: fmtIDR(stats?.totalFreightCost),
          },
          {
            icon: <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6 text-amber-500" />,
            bg: "bg-amber-50",
            label: "Total Insurance",
            value: fmtIDR(stats?.totalInsurance),
          },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-xl font-black text-[#1F2937] leading-tight">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Feasibility + Risk Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feasibility Score Distribution */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1 h-6 bg-[#00A651] rounded-full inline-block" />
            <h3 className="text-lg font-extrabold text-[#1F2937]">Feasibility Distribution</h3>
          </div>
          <div className="space-y-4">
            <BarRow label="High (≥8.0)" value={feasDist.high} total={feasDist.total} colorClass="bg-[#00A651]" />
            <BarRow label="Moderate (6.0 – 7.9)" value={feasDist.moderate} total={feasDist.total} colorClass="bg-amber-400" />
            <BarRow label="Low (<6.0)" value={feasDist.low} total={feasDist.total} colorClass="bg-rose-500" />
          </div>
          <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest border-t border-[#F3F4F6] pt-3">
            {feasDist.total} scored cases out of {cases.length} total
          </p>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1 h-6 bg-rose-500 rounded-full inline-block" />
            <h3 className="text-lg font-extrabold text-[#1F2937]">Risk Distribution</h3>
          </div>
          {riskDist ? (
            <div className="space-y-4">
              <BarRow label="Low Risk" value={riskDist.low} total={riskTotal} colorClass="bg-emerald-500" />
              <BarRow label="Medium Risk" value={riskDist.medium} total={riskTotal} colorClass="bg-amber-400" />
              <BarRow label="High Risk" value={riskDist.high} total={riskTotal} colorClass="bg-rose-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-[#9CA3AF] text-sm font-bold">No risk data available</div>
          )}
          <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest border-t border-[#F3F4F6] pt-3">
            Country · payment term · profitability risk
          </p>
        </div>
      </div>

      {/* Cases by Status */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-6 bg-blue-500 rounded-full inline-block" />
          <h3 className="text-lg font-extrabold text-[#1F2937]">Cases by Status</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats?.casesByStatus && Object.entries(stats.casesByStatus).map(([status, count]) => (
            <Link key={status} href="/own-export-cases" className="flex flex-col p-5 rounded-2xl bg-[#F9FAFB] border border-[#E8E3D9] hover:border-[#00A651]/40 hover:bg-[#EBF8F2]/40 transition-all group">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                {status.replace("_", " ")}
              </span>
              <span className="text-4xl font-black text-[#1F2937] group-hover:text-[#00A651] transition-colors">
                {count as number}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Cases */}
      {stats?.recentCases && stats.recentCases.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-green-500 rounded-full inline-block" />
            <h3 className="text-lg font-extrabold text-[#1F2937]">Recent Case Activity</h3>
          </div>
          <div className="space-y-3">
            {stats.recentCases.slice(0, 5).map((c: any, i: number) => (
              <Link key={i} href={`/own-export-cases/${c.caseId}`} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E8E3D9] hover:border-[#00A651]/40 hover:bg-[#EBF8F2]/30 transition-all group">
                <div className="flex items-center gap-3">
                  {c.feasibilityScore >= 8 ? <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-emerald-500" /> :
                    c.feasibilityScore >= 6 ? <Icon icon="solar:minus-circle-bold-duotone" className="w-4 h-4 text-amber-500" /> :
                      <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4 text-rose-500" />}
                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">{c.name}</p>
                    <p className="text-xs text-[#9CA3AF] font-medium">{c.destinationCountry}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#9CA3AF] group-hover:text-[#00A651] transition-colors">
                  {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("id-ID") : "—"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
