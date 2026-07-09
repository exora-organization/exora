"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";

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
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const stats = analyticsData?.data;
  const recentCases = casesData?.data?.items?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Export Manager Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of your company's export pipeline and performance.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/export-case">
            <Button variant="outline">View Export Cases</Button>
          </Link>
          <Link href="/export-case/new">
            <Button>Create Export Case</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExportCases || 0}</div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Total export cases in the company
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCases || 0}</div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Cases currently in review or draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
                ? stats.averageFeasibilityScore.toFixed(1) 
                : "0.0"
              } / 10
            </div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Average company-wide feasibility score
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h3 className="text-xl font-semibold mb-4">Recent Export Cases</h3>
        <Card>
          <CardContent className="p-0">
            {recentCases.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No recent cases found. Create one to get started.
              </div>
            ) : (
              <div className="divide-y">
                {recentCases.map((c) => (
                  <div key={c.caseId} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <Link href={`/export-case/${c.caseId}`} className="font-medium text-blue-600 hover:underline">
                        {c.name}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                        <span>{c.destinationCountry}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <div className="text-sm font-medium">
                          {c.feasibilityScore !== undefined && c.feasibilityScore !== null 
                            ? `${c.feasibilityScore.toFixed(1)}/10` 
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"}>
                        {c.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
