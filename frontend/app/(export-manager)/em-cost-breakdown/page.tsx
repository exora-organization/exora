"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiCosting } from "../../../lib/api/costing";
import { BarChart2, ChevronRight, AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

function CaseRow({ c }: { c: any }) {
  const { data: costData } = useQuery({
    queryKey: ["cost-data", c.caseId],
    queryFn: () => apiCosting.getCostData(c.caseId),
    retry: false,
    staleTime: 60_000,
  });
  const hasCost = !!costData?.data?.hpp;

  return (
    <Link
      href={`/export-case/${c.caseId}/costing`}
      className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#E8E3D9] shadow-sm hover:shadow-md hover:border-[#00A651]/40 hover:bg-[#EBF8F2]/30 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
          <BarChart2 className="w-4 h-4 text-[#00A651]" />
        </div>
        <div>
          <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
          <p className="text-xs text-[#9CA3AF] font-medium">{c.destinationCountry} · {c.status.replace("_", " ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasCost ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <CheckCircle className="w-3 h-3" /> Cost data available
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
            <AlertTriangle className="w-3 h-3" /> Pending Finance input
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

export default function EMCostBreakdownPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    return arr;
  }, [cases, search, statusFilter]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Cost Breakdown</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          View HPP, packaging, certification, freight, and insurance breakdowns per Incoterm — read-only (US-031, FR-012).
        </p>
      </div>
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        Cost data is entered by Finance Staff only. Cases pending input will show a warning indicator.
      </div>

      {/* Search & Filter */}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="finalized">Finalized</option>
          </select>
        </div>
        <div className="ml-auto text-xs font-bold text-[#9CA3AF] uppercase tracking-widest shrink-0">
          {filtered.length} of {cases.length}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#9CA3AF] font-bold">No cases match your search.</div>
        ) : filtered.map(c => <CaseRow key={c.caseId} c={c} />)}
      </div>
    </div>
  );
}
