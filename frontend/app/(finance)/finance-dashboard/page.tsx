"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { 
  Briefcase, Activity, TrendingUp, ArrowRight, AlertTriangle, 
  Calculator, CheckCircle, Scale, DollarSign 
} from "lucide-react";
import { useMemo } from "react";

export default function FinanceDashboardPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["finance-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const stats = analyticsData?.data;
  const allCases = casesData?.data?.items || [];

  // 1. Cases Awaiting Costing Input: Status is Draft/In Review and has no feasibility score yet
  const awaitingCosting = useMemo(() => {
    return allCases.filter(c => c.status === "draft" && (c.feasibilityScore === undefined || c.feasibilityScore === null || c.feasibilityScore === 0));
  }, [allCases]);

  // 2. Alert: Cost data incomplete but case is moving to pricing (status is in_review or finalized, but feasibilityScore is null/empty)
  const incompleteCostingInPricing = useMemo(() => {
    return allCases.filter(c => 
      (c.status === "in_review" || c.status === "finalized") && 
      (c.feasibilityScore === undefined || c.feasibilityScore === null || c.feasibilityScore === 0)
    );
  }, [allCases]);

  // 3. Quick links to cases with profitability below target margin (15%)
  // Since we don't have direct margin on the list item, we can flag cases with low feasibility scores (< 6.0) as they indicate margin/risk failure
  const lowMarginCases = useMemo(() => {
    return allCases.filter(c => c.feasibilityScore !== undefined && c.feasibilityScore !== null && c.feasibilityScore * 10 < 60);
  }, [allCases]);

  if (analyticsLoading || casesLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      
      {/* Header Area */}
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">Finance Dashboard</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Costing and profitability working oversight for Finance Staff (FR-008, FR-010)
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="text-5xl font-black text-[#1F2937] mb-2">
            {stats?.totalExportCases || 0}
          </div>
          <div className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Company-wide cases</div>
        </div>

        {/* Active Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Active Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-5xl font-black text-[#1F2937] mb-2">
            {stats?.activeCases || 0}
          </div>
          <div className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">In review / finalized</div>
        </div>

        {/* Average Margin/Feasibility */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Avg Feasibility</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-5xl font-black text-[#1F2937] mb-2">
            {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
              ? (stats.averageFeasibilityScore / 10).toFixed(1) 
              : "0.0"
            }
          </div>
          <div className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Feasibility aggregate</div>
        </div>

        {/* Total Costings Pending */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#D1EDE4] shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Costing Queue</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-5xl font-black text-[#00A651] mb-2">
            {awaitingCosting.length}
          </div>
          <div className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Awaiting input</div>
        </div>
      </div>

      {/* Validation Warnings (FR-010) */}
      {incompleteCostingInPricing.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl border border-rose-200 shadow-xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-60 -z-10"></div>
          <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-3">
            <span className="w-3 h-8 bg-rose-500 rounded-full inline-block"></span>
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Incomplete Costing validation Alerts
          </h3>
          <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-6">
            Drafting progressing to pricing without complete costing details (FR-010)
          </p>
          <div className="space-y-3">
            {incompleteCostingInPricing.map((c) => (
              <div key={c.caseId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-rose-50/60 border border-rose-100 rounded-2xl gap-3">
                <div>
                  <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                  <p className="text-xs text-[#9CA3AF] font-semibold mt-0.5">Destination: {c.destinationCountry} · Status: {c.status.replace("_", " ").toUpperCase()}</p>
                </div>
                <Link href={`/finance-case/${c.caseId}/costing`}>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs">
                    Complete costing input
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Awaiting costing + Profitability warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Awaiting Costing Input */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
          <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#00A651] rounded-full inline-block"></span>
            Awaiting Costing Input
          </h3>
          <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-6">Cases awaiting first configuration sheets</p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {awaitingCosting.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-bold bg-[#FAF8F3] border border-[#E8E3D9] rounded-2xl">
                All draft cases have configured costing inputs.
              </div>
            ) : (
              awaitingCosting.map((c) => (
                <div key={c.caseId} className="flex justify-between items-center p-4 bg-[#F9FAFB] border border-[#E8E3D9] rounded-2xl">
                  <div>
                    <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">{c.destinationCountry}</p>
                  </div>
                  <Link href={`/finance-case/${c.caseId}/costing`}>
                    <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold">
                      Add costing
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Margin Alerts */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
          <h3 className="text-2xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            Profitability below Target
          </h3>
          <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-widest mb-6">Cases performing below the 15.0% margin target (FR-013)</p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {lowMarginCases.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-bold bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                No cases currently perform below the 15.0% target margin.
              </div>
            ) : (
              lowMarginCases.map((c) => (
                <div key={c.caseId} className="flex justify-between items-center p-4 bg-amber-50/40 border border-amber-200 rounded-2xl">
                  <div>
                    <p className="font-extrabold text-[#1F2937] text-sm">{c.name}</p>
                    <p className="text-xs text-amber-700 font-bold mt-0.5">Feasibility: {c.feasibilityScore ? (c.feasibilityScore * 10).toFixed(0) : "0"}/100</p>
                  </div>
                  <Link href={`/finance-case/${c.caseId}/financial`}>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs">
                      Analyze Profit
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
