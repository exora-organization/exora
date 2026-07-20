"use client";

import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Briefcase, Search, Filter, ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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
      <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
            placeholder="Search by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
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

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#9CA3AF] font-bold">No cases match your filters.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E8E3D9]">
                <th className="text-left px-6 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Feasibility</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((c) => {
                const feas = feasibilityLabel(c.feasibilityScore);
                return (
                  <tr key={c.caseId} className="hover:bg-[#FAFCFB] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-[#00A651]" />
                        </div>
                        <span className="font-bold text-[#1F2937]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#4B5563]">{c.destinationCountry}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${statusColors[c.status] || "bg-gray-100 text-gray-700"}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${feas.bg} ${feas.color}`}>
                        {feas.label}
                        {c.feasibilityScore !== undefined && (
                          <span className="ml-1 opacity-70">({(c.feasibilityScore * 10).toFixed(0)})</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9CA3AF] font-medium">
                      {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/export-cases/${c.caseId}`} className="flex items-center gap-1 text-[#00A651] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:gap-2">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
