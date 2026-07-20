"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiFinancial } from "../../../lib/api/financial";
import { useState, useMemo } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { 
  ChevronDown, ChevronUp, AlertCircle, Loader2,
  Search, Filter, SlidersHorizontal
} from "lucide-react";

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
    <>
      <tr className="hover:bg-[#FAFCFB] transition-colors border-b border-[#F3F4F6]">
        <td className="px-6 py-4 font-bold text-[#1F2937]">{c.name}</td>
        <td className="px-4 py-4 font-semibold text-[#4B5563]">{c.destinationCountry}</td>
        <td className="px-4 py-4">
          <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"} className="font-bold py-1 px-3">
            {c.status.replace("_", " ").toUpperCase()}
          </Badge>
        </td>
        <td className="px-4 py-4">
          {c.feasibilityScore !== undefined && c.feasibilityScore !== null 
            ? <span className="font-black text-[#00A651]">{(c.feasibilityScore * 10).toFixed(0)}/100</span>
            : <span className="text-gray-400 font-bold">Unanalyzed</span>
          }
        </td>
        <td className="px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-900 font-bold flex items-center gap-1"
          >
            {isOpen ? (
              <>Hide Details <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Quick Profit View <ChevronDown className="w-4 h-4" /></>
            )}
          </Button>
        </td>
        <td className="px-6 py-4 text-right">
          <Link href={`/finance-case/${c.caseId}/financial`}>
            <Button className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold rounded-xl text-xs px-4">
              Open Simulator
            </Button>
          </Link>
        </td>
      </tr>
      
      {isOpen && (
        <tr className="bg-[#FAF8F3]/40 border-b border-[#E8E3D9]">
          <td colSpan={6} className="px-8 py-5">
            {finLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-[#00A651]" /> Loading financial metrics...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-rose-600 font-bold">
                <AlertCircle className="w-4 h-4" /> Costing data incomplete for this case. Configure costing sheet first.
              </div>
            ) : analysis ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-xl border border-[#E8E3D9]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Revenue</p>
                  <p className="text-base font-extrabold text-[#1F2937]">
                    Rp {(analysis.sellingPriceIDR * analysis.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E8E3D9]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Gross Profit</p>
                  <p className="text-base font-extrabold text-[#1F2937]">
                    Rp {((analysis.sellingPriceIDR - analysis.totalCostIDR) * analysis.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E8E3D9]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Profit Margin</p>
                  <p className={`text-base font-black ${analysis.profitMarginPct < 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {analysis.profitMarginPct.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E8E3D9]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Break Even Qty</p>
                  <p className="text-base font-extrabold text-[#1F2937]">
                    {Math.ceil(analysis.breakEvenQty).toLocaleString()} units
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 font-bold">No data found.</div>
            )}
          </td>
        </tr>
      )}
    </>
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
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Financial Analysis</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Perform margins checks, ROI calculations, and run simulations for export plans.
        </p>
      </div>

      {/* Search, Filter & Sort Bar */}
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
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
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
          {filtered.length} of {allCases.length} cases
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl overflow-hidden">
        <div className="bg-gray-50/50 border-b border-[#E8E3D9] px-6 py-4">
          <h3 className="text-lg font-bold text-[#1F2937]">Company Profitability Analysis</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50/40">
            <tr className="border-b border-[#E8E3D9]">
              <th className="text-left px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Status</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Feasibility</th>
              <th className="text-left px-4 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Quick View</th>
              <th className="text-right px-6 py-4 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Simulation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 font-bold text-gray-400">
                  No cases match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <FinancialCaseRow key={c.caseId} c={c} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
