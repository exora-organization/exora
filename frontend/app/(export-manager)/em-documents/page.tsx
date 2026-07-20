"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { FileBarChart2, FileText, ChevronRight, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

const DOCS = [
  { icon: <FileText className="w-4 h-4 text-blue-500" />, label: "Quotation" },
  { icon: <FileText className="w-4 h-4 text-indigo-500" />, label: "Proforma Invoice" },
];

export default function EMDocumentsPage() {
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
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Documents</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Generate Quotation and Proforma Invoice PDFs per case — downloadable in 3 clicks (FR-020, FR-021, NFR-010).
        </p>
      </div>

      {/* Document type legend */}
      <div className="grid grid-cols-2 gap-4">
        {DOCS.map(d => (
          <div key={d.label} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E8E3D9] shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
              {d.icon}
            </div>
            <div>
              <p className="font-extrabold text-sm text-[#1F2937]">{d.label}</p>
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">PDF · Per Case</p>
            </div>
          </div>
        ))}
      </div>

      {/* Case list */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
        <h3 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2 mb-5">
          <span className="w-2 h-5 bg-[#00A651] rounded-full" />
          Select a Case to Generate Documents
        </h3>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-3 items-center mb-5">
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
            <div className="py-12 text-center text-[#9CA3AF] font-bold">
              No cases match your search.
            </div>
          ) : filtered.map(c => (
            <Link
              key={c.caseId}
              href={`/export-case/${c.caseId}/documents`}
              className="flex items-center justify-between p-5 bg-[#F9FAFB] rounded-2xl border border-[#E8E3D9] hover:bg-white hover:shadow-md hover:border-[#00A651]/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
                  <FileBarChart2 className="w-4 h-4 text-[#00A651]" />
                </div>
                <div>
                  <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                  <p className="text-xs text-[#9CA3AF] font-medium">
                    {c.destinationCountry} ·{" "}
                    <span className={`font-bold ${
                      c.status === "finalized" ? "text-emerald-600" :
                      c.status === "in_review" ? "text-amber-600" :
                      "text-gray-500"
                    }`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00A651]">Generate / Download</span>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
