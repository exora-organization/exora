"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { EmptyState } from "../../../components/ui/EmptyState";

export default function ExportManagerDashboardPage() {
  const { data: casesData, isLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const allCases = casesData?.data?.items || [];

  // Work Queue: Cases needing EM action, sorted by urgency
  const workQueue = useMemo(() => {
    return [...allCases].sort((a, b) => {
      // Prioritize cases ready for pricing/review
      if (a.status === "in_review" && b.status !== "in_review") return -1;
      if (b.status === "in_review" && a.status !== "in_review") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allCases]);

  const counts = useMemo(() => {
    const readyForPricing = allCases.filter((c) => c.status === "in_review" || c.status === "draft").length;
    const needScenario = allCases.filter((c) => c.status === "in_review").length;
    return { readyForPricing, needScenario };
  }, [allCases]);

  const mostRecentCase = workQueue[0];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#1F2937] pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Export Manager Work Dashboard</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">Daily task queue & operational case execution</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/em-export-case/new">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer">
              <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" /> New Case
            </button>
          </Link>
        </div>
      </div>

      {/* COUNT BADGES / ACTION SIGNALS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Ready for Pricing</span>
            <Icon icon="solar:tag-price-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-3xl font-black text-emerald-950">{counts.readyForPricing} Cases</p>
          <p className="text-[11px] text-emerald-800 font-medium">Unblocked costing data ready for Incoterms strategy</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">Need Scenario Comparison</span>
            <Icon icon="solar:map-point-wave-bold-duotone" className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-950">{counts.needScenario} Cases</p>
          <p className="text-[11px] text-blue-800 font-medium">Pending freight & profit margin simulation</p>
        </div>

        {/* Shortcut to Most Recently Updated Case */}
        {mostRecentCase ? (
          <Link
            href={`/em-export-case/${mostRecentCase.caseId}`}
            className="bg-white border border-[#E8E3D9] hover:border-[#00A651] rounded-3xl p-5 shadow-sm space-y-1 transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shortcut: Recent Case</span>
              <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4 text-[#00A651] group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm font-extrabold text-[#1F2937] truncate">{mostRecentCase.name}</p>
            <p className="text-[11px] text-[#00A651] font-bold">Resume working on recent case →</p>
          </Link>
        ) : (
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shortcut</span>
            <p className="text-xs font-bold text-gray-400 mt-2">No active case shortcut available.</p>
          </div>
        )}
      </div>

      {/* QUICK SUMMARY: LAST CREATED PRICING SCENARIO */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <Icon icon="solar:calculator-bold-duotone" className="w-5 h-5 text-blue-600" />
            Last Created Pricing Scenario Quick Summary
          </h4>
          <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
            CIF JAPAN (MARCH)
          </span>
        </div>
        <div className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Incoterm</p>
            <p className="text-sm font-black text-[#1F2937]">CIF Tokyo Port</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Selling Price</p>
            <p className="text-sm font-black text-emerald-600">$ 48,500.00 / Cont</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Target Profit Margin</p>
            <p className="text-sm font-black text-blue-600">22.5%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Risk Level</p>
            <p className="text-sm font-black text-emerald-600">Low Risk (Score 84)</p>
          </div>
        </div>
      </div>

      {/* WORK TASK QUEUE (PRINCIPLE 1) */}
      <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
            <Icon icon="solar:case-minimalistic-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            Action Task Queue (Sorted by Urgency)
          </h3>
          <Link href="/em-export-case" className="text-xs font-bold text-[#00A651] hover:underline">
            View Full List ({allCases.length})
          </Link>
        </div>

        {allCases.length === 0 ? (
          <EmptyState
            icon="solar:case-minimalistic-bold-duotone"
            title="No Active Export Cases"
            description="Your work queue is empty. Initialize a new export case to begin pricing & scenario analysis."
            actionLabel="New Case"
            actionHref="/em-export-case/new"
          />
        ) : (
          <div className="space-y-3">
            {workQueue.map((c) => (
              <div
                key={c.caseId}
                className="p-4 bg-white hover:bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] flex items-center justify-between flex-wrap gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center font-bold text-sm shrink-0">
                    <Icon icon="solar:case-minimalistic-bold-duotone" className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1F2937]">{c.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{c.destinationCountry} · Created {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                    c.status === "finalized" ? "bg-emerald-100 text-emerald-800" :
                    c.status === "in_review" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {c.status.replace("_", " ")}
                  </span>
                  <Link href={`/em-export-case/${c.caseId}?tab=pricing`}>
                    <button className="px-4 py-2 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">
                      Work on Pricing →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
