"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";

const feasLabel = (score?: number | null) => {
  if (score == null) return { label: "Not scored", level: "none", color: "text-gray-500", bg: "bg-gray-100" };
  const pct = score * 10;
  if (pct >= 80) return { label: `High · ${pct.toFixed(0)}/100`, level: "high", color: "text-emerald-700", bg: "bg-emerald-100" };
  if (pct >= 60) return { label: `Moderate · ${pct.toFixed(0)}/100`, level: "moderate", color: "text-amber-700", bg: "bg-amber-100" };
  return { label: `Low · ${pct.toFixed(0)}/100`, level: "low", color: "text-rose-700", bg: "bg-rose-100" };
};

const SORT_OPTIONS = [
  { label: "Highest Feasibility", value: "feas_desc" },
  { label: "Lowest Feasibility", value: "feas_asc" },
  { label: "Newest First", value: "newest" },
  { label: "Name A → Z", value: "name_asc" },
] as const;

export default function EMRiskPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const [search, setSearch] = useState("");
  const [feasibilityFilter, setFeasibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("feas_desc");

  const cases = data?.data?.items || [];

  const filtered = useMemo(() => {
    let arr = [...cases];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) => c.name.toLowerCase().includes(q) || c.destinationCountry.toLowerCase().includes(q)
      );
    }
    if (feasibilityFilter !== "all") {
      arr = arr.filter((c) => feasLabel(c.feasibilityScore).level === feasibilityFilter);
    }
    arr.sort((a, b) => {
      if (sortBy === "feas_desc") return ((b.feasibilityScore ?? -1) - (a.feasibilityScore ?? -1));
      if (sortBy === "feas_asc") return ((a.feasibilityScore ?? 999) - (b.feasibilityScore ?? 999));
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });
    return arr;
  }, [cases, search, feasibilityFilter, sortBy]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" /></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Risk Assessment & Feasibility</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-2">
          Country risk, payment term risk, profitability risk, and Export Feasibility Score (0–100) per case (FR-015, FR-016).
        </p>
      </div>

      <div className="flex items-start gap-3 p-5 bg-[#EBF8F2]/80 backdrop-blur-md border border-[#00A651]/30 rounded-3xl text-sm text-[#1F5c34] font-semibold shadow-sm">
        <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
        View-only. Risk & feasibility scores are computed from cost data, market conditions, and payment terms for cases you manage.
      </div>

      {/* Search, Filter & Sort */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <Icon icon="solar:magnifer-linear" className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
            placeholder="Search by case name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value)}
          >
            <option value="all">All Feasibility</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
            <option value="none">Not Scored</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="solar:slider-horizontal-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-xs font-bold text-[#9CA3AF] uppercase tracking-widest shrink-0">
          {filtered.length} of {cases.length} cases
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">No cases match your filters.</div>
        ) : filtered.map(c => {
          const feas = feasLabel(c.feasibilityScore);
          return (
            <div key={c.caseId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
              
              {/* Case Info */}
              <div className="flex-[2] min-w-[200px] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6 text-[#00A651]" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#1F2937]">{c.name}</h4>
                  <p className="text-sm font-semibold text-[#4B5563] mt-1">{c.destinationCountry}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
                  c.status === "finalized" ? "bg-emerald-100 text-emerald-700" :
                  c.status === "in_review" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    c.status === "finalized" ? "bg-emerald-500" :
                    c.status === "in_review" ? "bg-amber-500" :
                    "bg-gray-500"
                  }`}></span>
                  {c.status.replace("_", " ")}
                </span>
              </div>

              {/* Feasibility */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Feasibility</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${feas.bg} ${feas.color}`}>
                  {feas.label}
                </span>
              </div>
              
              {/* Created Date */}
              <div className="flex-1 hidden md:block">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Created</p>
                <p className="text-xs font-bold text-[#4B5563]">
                  {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center md:ml-4 shrink-0">
                <Link href={`/em-export-case/${c.caseId}/risk`} className="inline-block">
                  <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl px-5 py-2.5 text-[13px] shadow-md shadow-[#00A651]/20 transition-all">
                    View Risk
                  </button>
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
