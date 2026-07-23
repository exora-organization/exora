"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Button } from "../../../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Icon } from "@iconify/react";

export default function AnalyticsDashboardPage() {
  const { loading: profileLoading, companyId } = useUserProfile();

  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: () => apiAnalytics.getDashboard(),
    enabled: !profileLoading && !!companyId,
  });

  if (profileLoading || (isLoading && !!companyId)) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-lg border border-red-100 flex flex-col items-center gap-4">
        <p className="text-xl">Unable to load analytics.</p>
        <p className="text-sm opacity-80">Please try again.</p>
        <Button onClick={() => refetch()} variant="destructive" className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  const metrics = analyticsData?.data;

  if (!metrics || metrics.totalExportCases === 0) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto pb-10 text-[#1F2937]">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm font-medium text-[#4B5563] mt-1">Company-wide export performance and insights.</p>
        </div>
        <div className="p-12 text-center bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-2">
            <Icon icon="solar:chart-bold-duotone" className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-[#1F2937]">No analytics available yet.</h3>
          <p className="text-sm font-bold text-[#9CA3AF] uppercase tracking-widest">Create export cases to begin generating insights.</p>
        </div>
      </div>
    );
  }

  // Format casesByStatus for Recharts PieChart
  const statusData = Object.entries(metrics.casesByStatus || {}).map(([key, value]) => ({
    name: key.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
    value,
  })).filter((item: any) => item.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10 text-[#1F2937]">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">Analytics Dashboard</h2>
        <p className="text-sm font-medium text-[#4B5563] mt-1">Company-wide export performance and insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Export Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon icon="solar:chart-bold-duotone" className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Total Export Cases</p>
            </div>
            <div className="text-6xl font-black text-[#1F2937] mb-2">{metrics.totalExportCases}</div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon icon="solar:pulse-bold-duotone" className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Active Cases</p>
            </div>
            <div className="text-6xl font-black text-[#1F2937] mb-2">{metrics.activeCases}</div>
          </div>
        </div>

        {/* Avg Feasibility Score */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon icon="solar:target-bold-duotone" className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Avg Feasibility Score</p>
            </div>
            <div className="text-6xl font-black text-[#1F2937] mb-2">
              {metrics.averageFeasibilityScore ? metrics.averageFeasibilityScore.toFixed(1) : "N/A"}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cases by Status */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Icon icon="solar:pie-chart-bold-duotone" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#1F2937]">Cases by Status</h3>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">Distribution of your export cases pipeline</p>
            </div>
          </div>

          <div className="h-[300px] mt-8">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    itemStyle={{ fontWeight: '900' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] text-sm font-bold uppercase tracking-widest">
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Export Cases */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-[#1F2937]">Recent Cases</h3>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">Latest cases created by the team</p>
            </div>
          </div>

          <div>
            {metrics.recentCases && metrics.recentCases.length > 0 ? (
              <ul className="space-y-4">
                {metrics.recentCases.map((rc: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:bg-white hover:shadow-md transition-all group/item">
                    <div className="w-2 h-2 rounded-full bg-green-500 group-hover/item:scale-150 transition-transform"></div>
                    <span className="text-sm font-extrabold text-[#1F2937] truncate flex-1">{rc.name || "Unknown Case"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">No recent cases listed</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
