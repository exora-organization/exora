"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { apiAnalytics } from "../../../lib/api/analytics";
import { FileText, TrendingUp, AlertTriangle, Users } from "lucide-react";

export default function OwnerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  const stats = data?.data;

  return (
    <div className="space-y-8 text-[#1F2937] relative pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Owner Dashboard</h2>
        <p className="text-sm text-[#9CA3AF] font-medium mt-1">Platform Overview</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00A651]" />
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">{stats?.totalExportCases || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1 font-medium">{stats?.activeCases || 0} active cases</p>
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
                ? (stats.averageFeasibilityScore / 10).toFixed(1) 
                : "0.0"
              } / 10
            </div>
            <p className="text-xs text-[#9CA3AF] mt-1 font-medium">Company-wide score</p>
          </CardContent>
        </Card>

        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#00A651]" />
              Risk Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#00A651]">Low Risk</span>
                  <span className="font-bold">{stats?.riskSummary?.low || 0}</span>
                </div>
                <div className="w-full bg-[#EBF8F2] rounded-full h-1.5">
                  <div 
                    className="bg-[#00A651] h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.riskSummary ? (stats.riskSummary.low / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-600">Medium Risk</span>
                  <span className="font-bold">{stats?.riskSummary?.medium || 0}</span>
                </div>
                <div className="w-full bg-[#EBF8F2] rounded-full h-1.5">
                  <div 
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.riskSummary ? (stats.riskSummary.medium / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-rose-600">High Risk</span>
                  <span className="font-bold">{stats?.riskSummary?.high || 0}</span>
                </div>
                <div className="w-full bg-[#EBF8F2] rounded-full h-1.5">
                  <div 
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.riskSummary ? (stats.riskSummary.high / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00A651]" />
              Team Summary
            </CardTitle>
            <div className="text-xs font-semibold px-2 py-0.5 bg-[#EBF8F2] text-[#00A651] rounded-full">
              {stats?.teamSummary?.totalMembers || 0}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
            <div className="space-y-2 mt-1">
              {stats?.teamSummary?.members && stats.teamSummary.members.length > 0 ? (
                stats.teamSummary.members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#1F2937] truncate">{member.displayName}</span>
                      <span className="text-[10px] text-[#9CA3AF] truncate">{member.email}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-[#EBF8F2] text-[#4B5563] capitalize shrink-0 ml-2">
                      {member.role.replace("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#9CA3AF] text-center py-4">No team members found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col mt-8">
        <h3 className="text-lg font-bold text-[#1F2937] mb-6">Cases By Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {stats?.casesByStatus && Object.entries(stats.casesByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-4 rounded-xl border border-[#D1EDE4] bg-[#EBF8F2]/50 hover:bg-[#EBF8F2] transition-colors">
              <span className="capitalize font-bold text-[#1F2937] text-sm">{status.replace("_", " ")}</span>
              <span className="text-xl font-bold text-[#00A651]">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
