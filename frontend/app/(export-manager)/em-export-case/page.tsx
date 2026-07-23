"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { ExportCaseListItem } from "../../../lib/types/export-case";
import { EmptyState } from "../../../components/ui/EmptyState";

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

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.destinationCountry.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") arr = arr.filter((c) => c.status === statusFilter);

    if (feasibilityFilter !== "all") {
      arr = arr.filter((c) => {
        const { label } = feasibilityLabel(c.feasibilityScore);
        return label.toLowerCase() === feasibilityFilter;
      });
    }

    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl font-bold">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Export Cases</h2>
          <p className="text-[#4B5563] mt-2 font-medium">
            {canCreate ? "Manage your company's export plans and monitor execution progress." : "Review your company's export plans."}
          </p>
        </div>
        {canCreate && (
          <Link href="/em-export-case/new">
            <Button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-2xl flex items-center gap-2 px-6 py-6 shadow-md hover:shadow-lg transition-all">
              <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
              New Case
            </Button>
          </Link>
        )}
      </div>

      {/* Action Required Badge */}
      {cases.filter((c) => c.status === "in_review" || c.status === "draft").length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-extrabold text-amber-900 shadow-sm">
          <Icon icon="solar:bell-bold-duotone" className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Action Required: You have {cases.filter((c) => c.status === "in_review" || c.status === "draft").length} export cases requiring Pricing or Risk Assessment simulation.
          </span>
        </div>
      )}

      {/* Search & Sort Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full max-w-lg">
          <input 
            type="text" 
            placeholder="Search by case name or country..." 
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/60 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white/90 text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Icon icon="solar:magnifer-bold-duotone" className="absolute right-4 top-3.5 h-5 w-5 text-[#9CA3AF]" />
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={feasibilityFilter}
              onChange={(e) => setFeasibilityFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-white/60 shadow-md bg-white/90 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00A651] cursor-pointer"
            >
              <option value="all">All Feasibility</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
              <option value="no score">No Score</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:slider-horizontal-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-white/60 shadow-md bg-white/90 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#00A651] cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {cases.length === 0 ? (
          <EmptyState
            icon="solar:case-minimalistic-bold-duotone"
            title="No Export Cases Yet"
            description="No export cases have been created. Click 'New Case' to initialize your first export plan."
            actionLabel="New Case"
            actionHref="/em-export-case/new"
          />
        ) : filtered.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
            No cases match your filters.
          </div>
        ) : (
          filtered.map((c) => {
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

                {/* Actions Button */}
                <div className="flex items-center md:ml-4 shrink-0">
                  <Link href={`/em-export-case/${c.caseId}`} className="inline-block">
                    <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl px-5 py-2.5 text-[13px] shadow-md shadow-[#00A651]/20 cursor-pointer">
                      View Detail
                    </button>
                  </Link>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
