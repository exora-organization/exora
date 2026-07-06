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
                ? stats.averageFeasibilityScore.toFixed(1) 
                : "0.0"
              } / 10
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Risk Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mt-2">Not supported by backend yet</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-dashed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Team Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mt-2">Not supported by backend yet</p>
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
