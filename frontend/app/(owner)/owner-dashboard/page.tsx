"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAnalytics } from "../../../lib/api/analytics";
import { FileText, TrendingUp, AlertTriangle, Users } from "lucide-react";

export default function OwnerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  if (isLoading) return (
    <div className="p-8 flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10">
      Failed to load dashboard data.
    </div>
  );

  const stats = data?.data;

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">Owner Dashboard</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">Real-time Platform Overview</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Cases Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#00A651]" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Total Cases</p>
            </div>
            <div className="text-5xl font-black text-[#1F2937] mb-2">{stats?.totalExportCases || 0}</div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8F2] text-[#00A651] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00A651] animate-pulse"></span>
              {stats?.activeCases || 0} Active
            </span>
          </div>
        </div>
        
        {/* Average Feasibility Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Avg Feasibility</p>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-5xl font-black text-[#1F2937]">
                {stats?.averageFeasibilityScore !== null && stats?.averageFeasibilityScore !== undefined 
                  ? (stats.averageFeasibilityScore / 10).toFixed(1) 
                  : "0.0"
                }
              </span>
              <span className="text-xl font-bold text-[#9CA3AF]">/ 10</span>
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
            Company-wide score
          </div>
        </div>

        {/* Risk Summary Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Risk Summary</p>
          </div>
          <div className="space-y-4 w-full">
            <div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <span className="text-[#00A651]">Low</span>
                <span className="text-[#1F2937]">{stats?.riskSummary?.low || 0}</span>
              </div>
              <div className="w-full bg-[#EBF8F2] rounded-full h-2">
                <div className="bg-[#00A651] h-2 rounded-full transition-all duration-1000" style={{ width: `${stats?.riskSummary ? (stats.riskSummary.low / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <span className="text-amber-500">Medium</span>
                <span className="text-[#1F2937]">{stats?.riskSummary?.medium || 0}</span>
              </div>
              <div className="w-full bg-[#EBF8F2] rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats?.riskSummary ? (stats.riskSummary.medium / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-1.5">
                <span className="text-rose-500">High</span>
                <span className="text-[#1F2937]">{stats?.riskSummary?.high || 0}</span>
              </div>
              <div className="w-full bg-[#EBF8F2] rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats?.riskSummary ? (stats.riskSummary.high / Math.max(1, stats.riskSummary.low + stats.riskSummary.medium + stats.riskSummary.high)) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Summary Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-2xl group flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Team</p>
            </div>
            <div className="text-xs font-black px-3 py-1 bg-[#EBF8F2] text-[#00A651] rounded-full border border-[#00A651]/20">
              {stats?.teamSummary?.totalMembers || 0}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[160px] pr-2 scrollbar-thin space-y-3">
            {stats?.teamSummary?.members && stats.teamSummary.members.length > 0 ? (
              stats.teamSummary.members.map((member, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFB] border border-[#E8E3D9] hover:bg-white hover:border-[#00A651]/30 transition-colors">
                  <div className="flex flex-col min-w-0 mr-2">
                    <span className="font-extrabold text-sm text-[#1F2937] truncate">{member.displayName}</span>
                    <span className="text-[10px] text-[#9CA3AF] truncate font-medium">{member.email}</span>
                  </div>
                  <span className="text-[9px] px-2 py-1 font-bold rounded-lg bg-[#EBF8F2] text-[#00A651] uppercase tracking-widest shrink-0">
                    {member.role.replace("_", " ").split(" ")[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">No Members</p>
              </div>
            )}
          </div>
        </div>
        
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        <h3 className="text-2xl font-extrabold text-[#1F2937] mb-8 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block"></span>
          Cases By Status
        </h3>
        
        <div className="grid gap-6 md:grid-cols-3">
          {stats?.casesByStatus && Object.entries(stats.casesByStatus).map(([status, count]) => (
            <div key={status} className="flex flex-col p-6 rounded-3xl border border-[#D1EDE4] bg-[#EBF8F2]/30 hover:bg-[#EBF8F2]/80 hover:shadow-lg transition-all group/card">
              <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 group-hover/card:text-[#00A651] transition-colors">{status.replace("_", " ")}</span>
              <span className="text-5xl font-black text-[#1F2937] group-hover/card:scale-105 transition-transform origin-left">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
