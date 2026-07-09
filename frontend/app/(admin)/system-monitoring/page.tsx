"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { apiAdmin } from "../../../lib/api/admin";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function SystemMonitoringPage() {
  const { firebaseUser, loading: authLoading } = useUserProfile();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => apiAdmin.getMonitoring(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  if (isLoading) return <div className="p-8 text-center">Loading system statistics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load system statistics</div>;

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Monitoring</h2>
        <p className="text-[#9CA3AF] mt-1">Real-time platform statistics based on backend data.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">{stats?.pendingApprovals || 0} pending approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">{stats?.activeUsersLast30Days || 0} active in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">Total Export Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExportCases || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">{stats?.userActivityStats?.casesCreatedLast7Days || 0} created last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">AI Usage (Recommendations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.aiUsageCount || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">Total lifetime usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">User Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.userActivityStats?.loginsLast7Days || 0}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#9CA3AF]">API Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500">Connected</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
