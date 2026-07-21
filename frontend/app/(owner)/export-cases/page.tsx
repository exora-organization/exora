"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { useState, useMemo } from "react";
import Link from "next/link";

import { ExportCaseListItem } from "../../../lib/types/export-case";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-amber-100 text-amber-800",
  finalized: "bg-emerald-100 text-emerald-800",
};

const feasibilityLabel = (score?: number) => {
  if (score === undefined || score === null) return { label: "No Score", color: "text-gray-400", bg: "bg-gray-50" };
  const pct = score * 10;
  if (pct >= 80) return { label: "High", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (pct >= 60) return { label: "Moderate", color: "text-amber-700", bg: "bg-amber-50" };
  return { label: "Low", color: "text-rose-700", bg: "bg-rose-50" };
};

export default function OwnerExportCasesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feasibilityFilter, setFeasibilityFilter] = useState("all");

  const cases: ExportCaseListItem[] = data?.data?.items || [];

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.destinationCountry.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const { label } = feasibilityLabel(c.feasibilityScore);
      const matchFeasibility = feasibilityFilter === "all" || label.toLowerCase() === feasibilityFilter;
      return matchSearch && matchStatus && matchFeasibility;
    });
  }, [cases, search, statusFilter, feasibilityFilter]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Export Cases</h2>
        <p className="text-sm text-[#6B7280] mt-1 font-medium">
          Company-wide export cases — read-only oversight view
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <Icon icon="solar:magnifer-linear" className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
            placeholder="Search by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400" />
          <select
            className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="finalized">Finalized</option>
          </select>
          <select
            className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value)}
          >
            <option value="all">All Feasibility</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="ml-auto text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">
          {filtered.length} of {cases.length} cases
        </div>
      </div>
      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
          No cases match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const feas = feasibilityLabel(c.feasibilityScore);
            return (
              <div key={c.caseId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
                
                {/* Case Info */}
                <div className="flex-[2] min-w-[200px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                    <Icon icon="solar:case-minimalistic-bold-duotone" className="w-6 h-6 text-[#00A651]" />
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
                    {c.feasibilityScore !== undefined && c.feasibilityScore !== null && (
                      <span className="ml-1 opacity-70">({(c.feasibilityScore * 10).toFixed(0)})</span>
                    )}
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
                  <Link href={`/export-cases/${c.caseId}`} className="inline-block">
                    <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl px-5 py-2.5 text-[13px] shadow-md shadow-[#00A651]/20">
                      View Detail
                    </button>
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
