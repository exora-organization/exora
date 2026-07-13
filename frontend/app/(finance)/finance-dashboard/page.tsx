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
    <div className="space-y-8 text-[#1F2937] relative pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance Dashboard</h2>
          <p className="text-sm text-[#9CA3AF] font-medium mt-1">Manage cost data and financial analysis for export cases.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#00A651]" />
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">{stats?.totalExportCases || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1 mb-2 font-medium">
              Total export cases
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00A651]" />
              Active Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">{stats?.activeCases || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1 mb-2 font-medium">
              Currently in review
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00A651]" />
              Average Feasibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">
              {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
                ? stats.averageFeasibilityScore.toFixed(1) 
                : "0.0"
              } <span className="text-xl text-[#9CA3AF] font-medium">/ 10</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1 mb-2 font-medium">
              Company-wide score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#1F2937]">Export Cases (Costing & Analysis)</h3>
          <Link href="/pricing" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
            Pricing Setup <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1">
          {allCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm font-medium text-[#9CA3AF]">No cases found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allCases.map((c) => (
                <div key={c.caseId} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[#D1EDE4] bg-[#EBF8F2]/50 hover:bg-[#EBF8F2] transition-colors gap-4">
                  <div>
                    <div className="font-bold text-[#1F2937] text-sm">
                      {c.name}
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-2">
                      <span className="font-medium text-[#4B5563]">{c.destinationCountry}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"} className="shadow-sm">
                      {c.status.replace("_", " ")}
                    </Badge>
                    <Link href={`/finance-case/${c.caseId}/costing`}>
                      <Button variant="outline" size="sm" className="border-[#D1EDE4] text-[#00A651] hover:bg-[#EBF8F2]">
                        Cost Data
                      </Button>
                    </Link>
                    <Link href={`/finance-case/${c.caseId}/financial`}>
                      <Button size="sm" className="bg-[#00A651] hover:bg-[#008F44] text-white shadow-sm">
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
