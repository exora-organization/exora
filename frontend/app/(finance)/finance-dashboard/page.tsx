"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { Briefcase, Activity, TrendingUp, ArrowRight } from "lucide-react";

export default function FinanceDashboardPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["finance-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  if (analyticsLoading || casesLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div></div>;
  }

  const stats = analyticsData?.data;
  const allCases = casesData?.data?.items || [];

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Finance Dashboard</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Manage cost data and financial analysis for export cases.</p>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {stats?.totalExportCases || 0}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-[#00A651] mr-2 shrink-0"></span>
            Total export cases
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Active Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {stats?.activeCases || 0}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 shrink-0"></span>
            Currently in review
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Average Feasibility</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
                ? stats.averageFeasibilityScore.toFixed(1) 
                : "0.0"
              }
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
            Company-wide score
          </div>
        </div>
      </div>

      {/* Export Cases Section */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative flex flex-col mt-10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
            Export Cases (Costing & Analysis)
          </h3>
          <Link href="/pricing" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
            Pricing Setup <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1">
          {allCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm font-bold text-[#4B5563]">No cases found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allCases.map((c) => (
                <div key={c.caseId} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-white bg-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all gap-4">
                  <div>
                    <div className="font-extrabold text-[#1F2937] text-base">
                      {c.name}
                    </div>
                    <div className="text-sm font-semibold text-[#4B5563] mt-1 flex items-center gap-2">
                      <span>{c.destinationCountry}</span>
                      <span className="text-[#9CA3AF]">•</span>
                      <span className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"} className="shadow-sm font-bold uppercase tracking-wider text-[10px] py-1 px-3">
                      {c.status.replace("_", " ")}
                    </Badge>
                    <Link href={`/finance-case/${c.caseId}/costing`}>
                      <Button variant="outline" size="sm" className="border-white/60 bg-white text-[#00A651] hover:bg-[#EBF8F2] font-bold shadow-sm rounded-xl">
                        Cost Data
                      </Button>
                    </Link>
                    <Link href={`/finance-case/${c.caseId}/financial`}>
                      <Button size="sm" className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold shadow-sm rounded-xl">
                        Financial Analysis
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
