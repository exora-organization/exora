"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiFinancial } from "../../../lib/api/financial";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A → Z", value: "name_asc" },
  { label: "Highest Feasibility", value: "feas_desc" },
  { label: "Lowest Feasibility", value: "feas_asc" },
] as const;

const feasLabel = (score?: number | null) => {
  if (score == null) return "no score";
  const pct = score * 10;
  if (pct >= 80) return "high";
  if (pct >= 60) return "moderate";
  return "low";
};

// Collapsible row that fetches the individual financial analysis data
function FinancialCaseRow({ c }: { c: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: finData, isLoading: finLoading, error } = useQuery({
    queryKey: ["financial-analysis", c.caseId],
    queryFn: () => apiFinancial.getAnalysis(c.caseId),
    enabled: isOpen,
  });

  const analysis = finData?.data?.analysis;

  return (
    <div className="flex flex-col bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
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

        {/* Feasibility */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Feasibility</p>
          {c.feasibilityScore !== undefined && c.feasibilityScore !== null 
            ? <span className="font-black text-[#00A651] text-lg">{(c.feasibilityScore * 10).toFixed(0)}/100</span>
            : <span className="text-gray-400 font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">Unanalyzed</span>
          }
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-2 font-bold text-sm text-[#00A651] hover:text-[#008F44] transition-colors py-2 px-3 rounded-full hover:bg-[#EBF8F2]"
          >
            {isOpen ? "Hide Overview" : "Quick Profit View"}
            <Icon icon={isOpen ? "solar:alt-arrow-up-bold-duotone" : "solar:alt-arrow-down-bold-duotone"} className="w-5 h-5" />
          </button>
          
          <Link href={`/fs-case/${c.caseId}/financial`} className="inline-block">
            <button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-full px-6 py-3 text-[13px] shadow-md shadow-[#00A651]/20 transition-all w-full md:w-auto">
              Open Simulator
            </button>
          </Link>
        </div>
      </div>

      {/* Expanded Quick View */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 bg-gradient-to-b from-white/0 to-[#FAF8F3]/50 border-t border-[#E8E3D9]/50">
          {finLoading ? (
            <div className="flex items-center gap-3 text-sm text-[#9CA3AF] font-bold py-4">
              <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-5 h-5 animate-spin text-[#00A651]" /> Loading financial metrics...
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-sm text-rose-600 font-bold py-4 bg-rose-50 px-5 rounded-2xl border border-rose-100">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6" /> Costing data incomplete for this case. Configure costing sheet first.
            </div>
          ) : analysis ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Icon icon="solar:wallet-money-bold-duotone" className="w-4 h-4 text-blue-500" /> Revenue
                </p>
                <p className="text-xl font-extrabold text-[#1F2937]">
                  Rp {(analysis.sellingPriceIDR * analysis.quantity).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Icon icon="solar:graph-up-bold-duotone" className="w-4 h-4 text-emerald-500" /> Gross Profit
                </p>
                <p className="text-xl font-extrabold text-[#1F2937]">
                  Rp {((analysis.sellingPriceIDR - analysis.totalCostIDR) * analysis.quantity).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Icon icon="solar:pie-chart-2-bold-duotone" className="w-4 h-4 text-purple-500" /> Profit Margin
                </p>
                <p className={`text-xl font-black ${analysis.profitMarginPct < 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {analysis.profitMarginPct.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/80 p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Icon icon="solar:box-minimalistic-bold-duotone" className="w-4 h-4 text-amber-500" /> Break Even Qty
                </p>
                <p className="text-xl font-extrabold text-[#1F2937]">
                  {Math.ceil(analysis.breakEvenQty).toLocaleString()} units
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 font-bold py-4">No data found.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfitabilityReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feasibilityFilter, setFeasibilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const allCases = data?.data?.items || [];

  const filtered = useMemo(() => {
    let arr = [...allCases];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (c) => c.name.toLowerCase().includes(q) || c.destinationCountry.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") arr = arr.filter((c) => c.status === statusFilter);
    if (feasibilityFilter !== "all") {
      arr = arr.filter((c) => feasLabel(c.feasibilityScore) === feasibilityFilter);
    }
    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "feas_desc") return ((b.feasibilityScore ?? -1) - (a.feasibilityScore ?? -1));
      if (sortBy === "feas_asc") return ((a.feasibilityScore ?? 999) - (b.feasibilityScore ?? 999));
      return 0;
    });
    return arr;
  }, [allCases, search, statusFilter, feasibilityFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#00A651]"></div>
      </div>
    );
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
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Financial Analysis</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-2">
          Perform margins checks, ROI calculations, and run simulations for export plans.
        </p>
      </div>

      {/* Search, Filter & Sort Bar */}
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
        <div className="flex items-center gap-2">
          <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value)}
          >
            <option value="all">All Feasibility</option>
            <option value="high">High (≥80)</option>
            <option value="moderate">Moderate (60–79)</option>
            <option value="low">Low (&lt;60)</option>
            <option value="no score">Unanalyzed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Icon icon="solar:slider-horizontal-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
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
          {filtered.length} of {allCases.length} cases
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">No cases match your filters.</div>
        ) : filtered.map((c) => (
          <FinancialCaseRow key={c.caseId} c={c} />
        ))}
      </div>
    </div>
  );
}
