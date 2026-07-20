"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Activity, ChevronRight, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

const INCOTERMS = ["EXW", "FOB", "CFR", "CIF"] as const;

export default function EMScenarioPage() {
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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Scenario Analysis</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Compare ≥2 Incoterm scenarios side-by-side with different exchange rates, margins, and payment terms (FR-014, US-021/022).
        </p>
      </div>

      {/* Incoterm legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INCOTERMS.map(term => (
          <div key={term} className="bg-white rounded-2xl border border-[#E8E3D9] p-4 text-center shadow-sm">
            <p className="text-xl font-black text-[#00A651]">{term}</p>
            <p className="text-xs text-[#9CA3AF] font-bold mt-1">Incoterm Scenario</p>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-semibold">
        Select a case below to open its scenario comparison tool. You can adjust exchange rate, margin, and payment term assumptions to see the impact on profitability and feasibility.
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
        ) : filtered.map(c => (
          <Link
            key={c.caseId}
            href={`/export-case/${c.caseId}/scenario`}
            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#E8E3D9] shadow-sm hover:shadow-md hover:border-[#00A651]/40 hover:bg-[#EBF8F2]/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#00A651]" />
              </div>
              <div>
                <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                <p className="text-xs text-[#9CA3AF] font-medium">{c.destinationCountry} · {c.status.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00A651]">Open Scenarios</span>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
