"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiAdvisor } from "../../../lib/api/advisor";
import {
  FileText, TrendingUp, Users, Lightbulb, ShieldCheck,
  AlertTriangle, ChevronRight, RefreshCw, Clock, Loader2
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function OwnerDashboardPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading: isStatsLoading, error } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ["owner-export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const { data: aiData, isLoading: isAiLoading, refetch: refetchAi } = useQuery({
    queryKey: ["owner-global-advisor"],
    queryFn: () => apiAdvisor.getGlobalRecommendation(),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiAdvisor.generateGlobalRecommendation({}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-global-advisor"] });
      toast.success("Portfolio feasibility analysis generated!");
      setIsGenerating(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Generation failed.");
      setIsGenerating(false);
    },
  });

  const stats = data?.data;
  const cases = casesData?.data?.items || [];
  const recommendation = aiData?.data?.recommendation;

  const feasibilityDistribution = useMemo(() => {
    let high = 0, moderate = 0, low = 0;
    cases.forEach((c) => {
      const score = c.feasibilityScore != null ? c.feasibilityScore * 10 : 0;
      if (score >= 80) high++;
      else if (score >= 60) moderate++;
      else if (score > 0) low++;
    });
    const total = high + moderate + low;
    return { high, moderate, low, total };
  }, [cases]);

  // FR-016: Cases with Low feasibility that need attention
  const lowFeasibilityCases = useMemo(() =>
    cases.filter((c) => c.feasibilityScore != null && c.feasibilityScore * 10 < 60)
      .sort((a, b) => (a.feasibilityScore ?? 0) - (b.feasibilityScore ?? 0))
      .slice(0, 5),
    [cases]
  );

  if (isStatsLoading || isCasesLoading) return (
    <div className="p-8 flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10">
      Failed to load dashboard data.
    </div>
  );

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">Owner Dashboard</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">Company-wide operations & export feasibility oversight</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/export-cases" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between cursor-pointer">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#00A651]" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Total Cases</p>
            </div>
            <div className="text-5xl font-black text-[#1F2937] mb-2">{stats?.totalExportCases || 0}</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F2] text-[#00A651] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00A651] animate-pulse" />
              {stats?.activeCases || 0} Active
            </span>
          </div>
        </Link>

        <Link href="/owner-analytics" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between cursor-pointer">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Avg Feasibility</p>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black text-[#1F2937]">
                {stats?.averageFeasibilityScore != null
                  ? (stats.averageFeasibilityScore / 10).toFixed(1)
                  : "0.0"}
              </span>
              <span className="text-xl font-bold text-[#9CA3AF]">/ 10</span>
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Company-wide score</div>
        </Link>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:shadow-2xl group flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Feasibility Distribution</p>
          </div>
          <div className="space-y-4 w-full">
            {[
              { label: "High (≥8.0)", count: feasibilityDistribution.high, barColor: "bg-[#00A651]", textColor: "text-[#00A651]", bg: "bg-[#EBF8F2]" },
              { label: "Moderate (6.0–7.9)", count: feasibilityDistribution.moderate, barColor: "bg-amber-500", textColor: "text-amber-500", bg: "bg-amber-50" },
              { label: "Low (<6.0)", count: feasibilityDistribution.low, barColor: "bg-rose-500", textColor: "text-rose-500", bg: "bg-rose-50" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5">
                  <span className={item.textColor}>{item.label}</span>
                  <span className="text-[#1F2937]">{item.count}</span>
                </div>
                <div className={`w-full ${item.bg} rounded-full h-2`}>
                  <div className={`${item.barColor} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${feasibilityDistribution.total ? (item.count / feasibilityDistribution.total) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/team-management" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Team</p>
            </div>
            <div className="text-xs font-black px-3 py-1 bg-[#EBF8F2] text-[#00A651] rounded-full border border-[#00A651]/20">
              {stats?.teamSummary?.totalMembers || 0}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[160px] space-y-3">
            {stats?.teamSummary?.members?.length ? (
              stats.teamSummary.members.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFB] border border-[#E8E3D9]">
                  <div className="flex flex-col min-w-0 mr-2">
                    <span className="font-extrabold text-sm text-[#1F2937] truncate">{member.displayName}</span>
                    <span className="text-[10px] text-[#9CA3AF] truncate font-medium">{member.email}</span>
                  </div>
                  <span className="text-[9px] px-2 py-1 font-bold rounded-lg bg-[#EBF8F2] text-[#00A651] uppercase tracking-widest shrink-0">
                    {member.role.replace("_", " ").split(" ")[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">No Members</p>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* FR-016: Low Feasibility Quick-Links */}
      {lowFeasibilityCases.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border border-rose-200 shadow-xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-60 -z-10" />
          <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-3">
            <span className="w-3 h-8 bg-rose-500 rounded-full inline-block" />
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Cases Needing Attention
          </h3>
          <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-6">
            Low feasibility (&lt;60%) — FR-016
          </p>
          <div className="space-y-3">
            {lowFeasibilityCases.map((c) => (
              <Link
                key={c.caseId}
                href={`/export-cases/${c.caseId}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-rose-50/60 border border-rose-200 hover:border-rose-400 hover:bg-rose-50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">{c.name}</p>
                    <p className="text-xs text-[#9CA3AF] font-medium">{c.destinationCountry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-black">
                    {c.feasibilityScore != null ? `${(c.feasibilityScore * 10).toFixed(0)}/100` : "—"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI Advisor — Portfolio Feasibility (generate + view, FR-009a) */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full opacity-50 -z-10" />
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-indigo-600 rounded-full inline-block" />
            <Lightbulb className="w-6 h-6 text-indigo-500" />
            AI Advisor — Portfolio Feasibility
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
              FR-009a · generate + view
            </span>
            <button
              onClick={() => { setIsGenerating(true); generateMutation.mutate(); }}
              disabled={generateMutation.isPending || isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all hover:-translate-y-0.5"
            >
              {generateMutation.isPending || isGenerating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5" /> {recommendation ? "Regenerate" : "Generate"}</>
              )}
            </button>
          </div>
        </div>

        {isAiLoading ? (
          <div className="flex justify-center items-center h-24 font-bold text-[#4B5563]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading recommendations...
          </div>
        ) : recommendation ? (
          <div className="space-y-4">
            <div className="flex gap-4 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 shadow-sm flex-col">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Portfolio Feasibility Guidance
                </span>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-100 text-indigo-700 uppercase tracking-widest">
                    Confidence: {recommendation.confidence}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(recommendation.generatedAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-indigo-950 font-semibold leading-relaxed">
                <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/ai-advisor" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Full AI Advisor <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#9CA3AF] bg-[#FAF8F3] border border-[#E8E3D9] rounded-2xl">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">No portfolio recommendation yet.</p>
            <p className="text-xs mt-1">Click "Generate" to create a company-wide feasibility summary using your export cases.</p>
          </div>
        )}
      </div>

      {/* Recent AI Advisor Activity Feed — FR-009a */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10" />
        <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block" />
          Recent AI Advisor Activity
        </h3>
        <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-6">
          Who generated what, and when — FR-009a
        </p>
        {recommendation ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F9FAFB] border border-[#E8E3D9]">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#1F2937]">Portfolio Feasibility Analysis</p>
                <p className="text-xs text-[#9CA3AF] font-medium truncate">Company-wide · {cases.length} cases analysed</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF] font-medium shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(recommendation.generatedAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-[#9CA3AF] text-sm font-bold">
            No AI activity yet. Generate a portfolio recommendation above to see activity here.
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Link href="/ai-advisor" className="text-xs font-bold text-[#00A651] hover:underline flex items-center gap-1">
            Open full AI Advisor <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Cases By Status */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700" />
        <h3 className="text-2xl font-extrabold text-[#1F2937] mb-8 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block" />
          Cases By Status
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {stats?.casesByStatus && Object.entries(stats.casesByStatus).map(([status, count]) => (
            <Link key={status} href="/export-cases" className="flex flex-col p-6 rounded-3xl border border-[#D1EDE4] bg-[#EBF8F2]/30 hover:bg-[#EBF8F2]/80 hover:shadow-lg transition-all group/card cursor-pointer">
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 group-hover/card:text-[#00A651] transition-colors">
                {status.replace("_", " ")}
              </span>
              <span className="text-5xl font-black text-[#1F2937] group-hover/card:scale-105 transition-transform origin-left">
                {count as number}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
