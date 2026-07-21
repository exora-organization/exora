"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Icon } from "@iconify/react";
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Scenario Analysis</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-2">
          Compare ≥2 Incoterm scenarios side-by-side with different exchange rates, margins, and payment terms (FR-014, US-021/022).
        </p>
      </div>

      {/* Incoterm legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INCOTERMS.map(term => (
          <div key={term} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 p-6 text-center shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all">
            <p className="text-2xl font-black text-[#00A651]">{term}</p>
            <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mt-1">Incoterm Scenario</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 p-5 bg-amber-50/80 backdrop-blur-md border border-amber-200 rounded-3xl text-sm text-amber-800 font-semibold shadow-sm">
        <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        Select a case below to open its scenario comparison tool. You can adjust exchange rate, margin, and payment term assumptions to see the impact on profitability and feasibility.
      </div>

      {/* Search & Filter */}
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
          {filtered.length} of {cases.length} cases
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">No cases match your filters.</div>
        ) : filtered.map(c => (
          <div key={c.caseId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
            
            {/* Case Info */}
            <div className="flex-[2] min-w-[200px] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                <Icon icon="solar:pulse-bold-duotone" className="w-6 h-6 text-[#00A651]" />
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
            
            {/* Created Date */}
            <div className="flex-1 hidden md:block">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Created</p>
              <p className="text-xs font-bold text-[#4B5563]">
                {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center md:ml-4 shrink-0">
              <Link href={`/export-case/${c.caseId}/scenario`} className="inline-block">
                <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl px-5 py-2.5 text-[13px] shadow-md shadow-[#00A651]/20 transition-all">
                  Open Scenarios
                </button>
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
