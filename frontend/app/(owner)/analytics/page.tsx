"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function AnalyticsDashboardPage() {
  // Query hook to fetch unified dashboard metrics from the analytics API endpoint.
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Unable to load analytics. Please retry.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = analyticsData?.data;

  if (!metrics || metrics.totalExportCases === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Analytics Dashboard</h2>
        <Alert>
          <AlertTitle>No analytics available yet.</AlertTitle>
          <AlertDescription>Create export cases to begin generating insights.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format casesByStatus for Recharts PieChart
  const statusData = Object.entries(metrics.casesByStatus || {}).map(([key, value]) => ({
    name: key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    value,
  })).filter(item => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-[#9CA3AF] mt-1">Company-wide export performance and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Export Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalExportCases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCases}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Feasibility Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageFeasibilityScore ? metrics.averageFeasibilityScore.toFixed(1) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
            <CardDescription>Distribution of your export cases pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] text-sm">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Export Cases</CardTitle>
            <CardDescription>Latest cases created by the team.</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentCases && metrics.recentCases.length > 0 ? (
              <ul className="space-y-3">
                {metrics.recentCases.map((rc: any, idx) => (
                  <li key={idx} className="text-sm border-b pb-2 last:border-0">{rc.name || "Unknown Case"}</li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-[#9CA3AF] py-4 text-center">
                No recent cases listed.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
