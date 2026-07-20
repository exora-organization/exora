"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { ShieldCheck, ChevronRight, Info, Search, Filter, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Risk Assessment & Feasibility</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Country risk, payment term risk, profitability risk, and Export Feasibility Score (0–100) per case (FR-015, FR-016).
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-[#EBF8F2] border border-[#00A651]/30 rounded-2xl text-sm text-[#1F5c34] font-semibold">
        <Info className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
        View-only. Risk & feasibility scores are computed from cost data, market conditions, and payment terms for cases you manage.
      </div>

      {/* Search, Filter & Sort */}
      <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
            placeholder="Search case or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
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
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
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
          {filtered.length} of {cases.length}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#9CA3AF] font-bold">No cases match your filters.</div>
        ) : filtered.map(c => {
          const feas = feasLabel(c.feasibilityScore);
          return (
            <Link
              key={c.caseId}
              href={`/export-case/${c.caseId}/risk`}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#E8E3D9] shadow-sm hover:shadow-md hover:border-[#00A651]/40 hover:bg-[#EBF8F2]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#00A651]" />
                </div>
                <div>
                  <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                  <p className="text-xs text-[#9CA3AF] font-medium">{c.destinationCountry} · {c.status.replace("_", " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${feas.bg} ${feas.color}`}>
                  {feas.label}
                </span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
