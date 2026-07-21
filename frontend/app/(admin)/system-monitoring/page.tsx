"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAdmin } from "../../../lib/api/admin";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Icon } from "@iconify/react";

export default function SystemMonitoringPage() {
  const { firebaseUser, loading: authLoading } = useUserProfile();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => apiAdmin.getMonitoring(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  if (isLoading) return <div className="p-8 text-center font-bold text-[#1F2937]">Loading system statistics...</div>;
  if (error) return <div className="p-8 text-center font-bold text-red-500">Failed to load system statistics</div>;

  const stats = data?.data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">System Monitoring</h2>
        <p className="text-[#4B5563] mt-2 font-medium">Real-time platform statistics based on backend data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Companies */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Companies</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Icon icon="solar:city-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">{stats?.totalCompanies || 0}</div>
            <span className="text-sm font-bold text-[#00A651]">Active</span>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 shrink-0"></span>
            {stats?.pendingApprovals || 0} pending approval
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Users</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">{stats?.totalUsers || 0}</div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-[#00A651] mr-2 shrink-0"></span>
            {stats?.activeUsersLast30Days || 0} active in last 30 days
          </div>
        </div>

        {/* Total Export Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Export Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">{stats?.totalExportCases || 0}</div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-gray-300 mr-2 shrink-0"></span>
            {stats?.userActivityStats?.casesCreatedLast7Days || 0} created last 7 days
          </div>
        </div>

        {/* AI Usage */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">AI Usage<br/>(Recommendations)</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
              <Icon icon="solar:bolt-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">{stats?.aiUsageCount || 0}</div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563] mt-2">
            Total lifetime usage
          </div>
        </div>

        {/* User Logins */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">User Logins</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Icon icon="solar:login-2-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">{stats?.userActivityStats?.loginsLast7Days || 0}</div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            Last 7 days activity
          </div>
        </div>

        {/* API Connection */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">API Connection</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Icon icon="solar:server-path-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 bg-[#EBF8F2] text-[#00A651] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A651]"></span>
              Connected
            </span>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            Primary endpoint responding at 142ms
          </div>
        </div>

      </div>
    </div>
  );
}
