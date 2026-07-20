"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useState, useMemo } from "react";
import {
  Briefcase, Search, Filter, SlidersHorizontal, Plus, ChevronRight,
  AlertTriangle, CheckCircle, TrendingUp
} from "lucide-react";
import { ExportCaseListItem } from "../../../lib/types/export-case";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "In Review", value: "in_review" },
  { label: "Finalized", value: "finalized" },
] as const;

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A → Z", value: "name_asc" },
  { label: "Name Z → A", value: "name_desc" },
  { label: "Highest Feasibility", value: "feas_desc" },
  { label: "Lowest Feasibility", value: "feas_asc" },
] as const;

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_review: "bg-amber-100 text-amber-800",
  finalized: "bg-emerald-100 text-emerald-800",
};

const feasibilityLabel = (score?: number) => {
  if (score === undefined || score === null)
    return { label: "No Score", color: "text-gray-400", bg: "bg-gray-50" };
  const pct = score * 10;
  if (pct >= 80) return { label: "High", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (pct >= 60) return { label: "Moderate", color: "text-amber-700", bg: "bg-amber-50" };
  return { label: "Low", color: "text-rose-700", bg: "bg-rose-50" };
};

export default function ExportCaseListPage() {
  const { profile } = useUserProfile();
  const canCreate = profile?.role === "export_manager" || profile?.role === "admin";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feasibilityFilter, setFeasibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const cases: ExportCaseListItem[] = data?.data?.items || [];

  const filtered = useMemo(() => {
    let arr = [...cases];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.destinationCountry.toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") arr = arr.filter((c) => c.status === statusFilter);

    // Feasibility
    if (feasibilityFilter !== "all") {
      arr = arr.filter((c) => {
        const { label } = feasibilityLabel(c.feasibilityScore);
        return label.toLowerCase() === feasibilityFilter;
      });
    }

    // Sort
    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "feas_desc") return ((b.feasibilityScore ?? -1) - (a.feasibilityScore ?? -1));
      if (sortBy === "feas_asc") return ((a.feasibilityScore ?? 999) - (b.feasibilityScore ?? 999));
      return 0;
    });

    return arr;
  }, [cases, search, statusFilter, feasibilityFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-bold">Failed to load export cases.</p>
        <Button onClick={() => refetch()} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Export Cases</h2>
          <p className="text-sm text-[#6B7280] mt-1 font-medium">
            {canCreate ? "Manage your company's export plans" : "Review your company's export plans (read-only)"}
          </p>
        </div>
        {canCreate && (
          <Link href="/export-case/new">
            <Button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl flex items-center gap-2 px-5">
              <Plus className="w-4 h-4" /> New Case
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
            placeholder="Search by case name or country..."
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
            <option value="no score">No Score</option>
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
          {filtered.length} of {cases.length} cases
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? cases.length : cases.filter((c) => c.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === tab.value
                  ? "bg-[#00A651] text-white shadow-md"
                  : "bg-white border border-[#E8E3D9] text-[#6B7280] hover:border-[#00A651]/40 hover:text-[#00A651]"
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                statusFilter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
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
                        {c.feasibilityScore !== undefined && c.feasibilityScore !== null && (
                          <span className="ml-1 opacity-70">({(c.feasibilityScore * 10).toFixed(0)})</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#9CA3AF] font-medium">
                      {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/export-case/${c.caseId}`}
                        className="flex items-center gap-1 text-[#00A651] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:gap-2"
                      >
                        {canCreate ? "Manage" : "View"} <ChevronRight className="w-3 h-3" />
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
