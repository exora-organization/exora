"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";

export default function CostingCaseListPage() {
  const { data, isLoading, error, refetch } = useQuery({
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

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-xl">
        <p>Failed to load export cases.</p>
        <button onClick={() => refetch()} className="mt-4 rounded-full bg-red-600 text-white px-6 py-2 shadow-md hover:bg-red-700 transition-all">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Export Cases (Costing)</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-2">
          Configure product costing sheets and logistics charges for active cases.
        </p>
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
                <Icon icon="solar:calculator-bold-duotone" className="w-6 h-6 text-[#00A651]" />
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
              <Link href={`/finance-case/${c.caseId}/costing`} className="inline-block">
                <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-full px-6 py-3 text-[13px] shadow-md shadow-[#00A651]/20 transition-all">
                  Configure Costing
                </button>
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
