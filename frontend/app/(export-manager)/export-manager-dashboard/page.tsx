"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { Briefcase, Activity, BarChart, Plus, ArrowRight } from "lucide-react";

export default function ExportManagerDashboardPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  if (analyticsLoading || casesLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a8c4f]"></div></div>;
  }

  const stats = analyticsData?.data;
  const recentCases = casesData?.data?.items?.slice(0, 5) || [];

  return (
    <div className="space-y-8 text-[#1F2937] relative pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Manager Dashboard</h2>
          <p className="text-sm text-[#9CA3AF] font-medium mt-1">Overview of your company's export pipeline and performance.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/export-case">
            <Button variant="outline" className="border-[#E8E3D9] text-[#4B5563] bg-white hover:bg-[#FAF8F3] font-medium">
              View Cases
            </Button>
          </Link>
          <Link href="/export-case/new">
            <Button className="bg-[#2F6B4F] hover:bg-[#087a44] text-white font-medium shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Case
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2F6B4F]" />
              My Cases
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
              <Activity className="w-4 h-4 text-[#2F6B4F]" />
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
              <BarChart className="w-4 h-4 text-[#2F6B4F]" />
              Recent Analysis
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
              Avg feasibility score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#1F2937]">Recent Export Cases</h3>
          <Link href="/export-case" className="text-sm font-bold text-[#2F6B4F] hover:text-[#087a44] flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex-1">
          {recentCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-sm font-medium text-[#9CA3AF]">No recent cases found.</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCases.map((c) => (
                <div key={c.caseId} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[#E8E3D9] bg-[#FAF8F3]/50 hover:bg-[#FAF8F3] transition-colors gap-4">
                  <div>
                    <Link href={`/export-case/${c.caseId}`} className="font-bold text-[#1F2937] text-sm hover:text-[#2F6B4F] transition-colors">
                      {c.name}
                    </Link>
                    <div className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-2">
                      <span className="font-medium text-[#4B5563]">{c.destinationCountry}</span>
                      <span>•</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end md:self-auto">
                    <div className="text-right hidden md:block">
                      <div className="text-sm font-bold text-[#1F2937]">
                        {c.feasibilityScore !== undefined && c.feasibilityScore !== null 
                          ? `${c.feasibilityScore.toFixed(1)}/10` 
                          : "-"}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">Score</div>
                    </div>
                    <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"} className="shadow-sm">
                      {c.status.replace("_", " ")}
                    </Badge>
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
