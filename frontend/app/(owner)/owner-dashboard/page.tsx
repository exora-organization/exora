"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { apiAnalytics } from "../../../lib/api/analytics";

export default function OwnerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Owner Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExportCases || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{stats?.activeCases || 0} active cases</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Feasibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
                ? (stats.averageFeasibilityScore / 10).toFixed(1) 
                : "0.0"
              } / 10
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-600">Low Risk</span>
                  <span className="font-bold">{stats?.riskSummary?.low || 0}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.riskSummary ? (stats.riskSummary.low / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-600">Medium Risk</span>
                  <span className="font-bold">{stats?.riskSummary?.medium || 0}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
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
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stats?.riskSummary ? (stats.riskSummary.high / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Summary</CardTitle>
            <div className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
              {stats?.teamSummary?.totalMembers || 0} Members
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
            <div className="space-y-2 mt-1">
              {stats?.teamSummary?.members && stats.teamSummary.members.length > 0 ? (
                stats.teamSummary.members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-gray-900 truncate">{member.displayName}</span>
                      <span className="text-[10px] text-gray-400 truncate">{member.email}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 font-medium rounded-full bg-gray-100 text-gray-600 capitalize shrink-0 ml-2">
                      {member.role.replace("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No team members found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">Cases By Status</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {stats?.casesByStatus && Object.entries(stats.casesByStatus).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4 flex justify-between items-center">
              <span className="capitalize font-medium">{status.replace("_", " ")}</span>
              <span className="text-xl font-bold">{count}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
