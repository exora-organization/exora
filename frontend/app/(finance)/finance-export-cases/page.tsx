"use client";

import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Info, Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A → Z", value: "name_asc" },
  { label: "Name Z → A", value: "name_desc" },
] as const;

export default function FinanceExportCasesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const cases = data?.data?.items || [];

  const filtered = useMemo(() => {
    let arr = [...cases];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) => c.name.toLowerCase().includes(q) || c.destinationCountry.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") arr = arr.filter((c) => c.status === statusFilter);
    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });
    return arr;
  }, [cases, search, statusFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10">
        <p>Failed to load export cases.</p>
        <Button onClick={() => refetch()} variant="destructive" className="mt-4 rounded-xl">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Export Cases (View Only)</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Review general export case registry parameters (FR-007)
        </p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 p-4 bg-[#FAF8F3] border border-[#E8E3D9] rounded-2xl text-sm text-[#78350F] font-semibold">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold mb-1">Metadata-Only Access Restricted</p>
          <p className="text-xs text-[#92400E] font-medium leading-relaxed">
            In compliance with FR-007, Finance Staff may only view case metadata. Detailed costing sheets and financial simulations are restricted to cases assigned to you under your Costing Configuration dashboard.
          </p>
        </div>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="finalized">Finalized</option>
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

      {/* Table */}
      <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl overflow-hidden">
        <div className="bg-gray-50/50 border-b border-[#E8E3D9] px-6 py-4">
          <h3 className="text-lg font-bold text-[#1F2937]">Company Export Case Registry</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/40">
            <tr className="border-b border-[#E8E3D9]">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Date Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 font-bold text-gray-400">
                  No cases match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.caseId} className="hover:bg-[#FAFCFB] transition-colors border-b border-[#F3F4F6]">
                  <td className="px-6 py-4 font-bold text-[#1F2937]">{c.name}</td>
                  <td className="px-4 py-4 font-semibold text-[#4B5563]">{c.destinationCountry}</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"}
                      className="font-bold py-1 px-3"
                    >
                      {c.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-400 font-bold">
                    {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
