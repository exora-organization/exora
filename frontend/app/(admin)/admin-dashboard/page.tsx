"use client";

import * as React from "react";
import { Search, Building, Users, Activity, FileText, ArrowRight, Clock, Building2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";

export default function AdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: monitoringData, isLoading: isMonitoringLoading } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => apiAdmin.getMonitoring(),
  });

  const { data: applicationsData, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
  });

  const { data: auditData, isLoading: isAuditLoading } = useQuery({
    queryKey: ["admin-audit-logs", 5],
    queryFn: () => apiAdmin.getAuditLogs(5),
  });

  const stats = monitoringData?.data;
  
  // Filter only pending applications and take latest 5
  const allPendingApplications = applicationsData?.data?.items
    ?.filter(app => app.status === "pending") || [];

  const pendingApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? allPendingApplications.filter(
          (app) =>
            app.companyName?.toLowerCase().includes(q) ||
            app.applicant?.email?.toLowerCase().includes(q)
        )
      : allPendingApplications;
    return filtered.slice(0, 5);
  }, [allPendingApplications, searchQuery]);

  const allLogs = auditData?.data?.auditLogs || [];
  const recentLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? allLogs.filter(
          (log: any) =>
            log.action?.toLowerCase().includes(q) ||
            log.resource?.toLowerCase().includes(q) ||
            log.actorId?.toLowerCase().includes(q)
        )
      : allLogs;
  }, [allLogs, searchQuery]);

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Admin Dashboard</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Platform Overview</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            id="admin-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications & activity..." 
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/60 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white/90 backdrop-blur-md text-sm font-medium"
          />
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link href="/company-approvals" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative group transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">Pending Approvals</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-4xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.pendingApprovals ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 shrink-0"></span>
            Awaiting review
          </div>
        </Link>

        <Link href="/company-approvals" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative group transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">Total Companies</h3>
            <div className="w-8 h-8 rounded-lg bg-[#EBF8F2] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-4xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalCompanies ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-[#00A651] mr-2 shrink-0"></span>
            Registered companies
          </div>
        </Link>

        <Link href="/users" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative group transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">Total Users</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-4xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalUsers ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
            Across all roles
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">Active Users</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-4xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.activeUsersLast30Days ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
            Active last 30 days
          </div>
        </div>

        <Link href="/export-case" className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 relative group transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest mt-1">Total Export Cases</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-4xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalExportCases ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-xs font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 shrink-0"></span>
            System export cases
          </div>
        </Link>
      </div>

      {/* Platform Activity Metrics */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 mt-8">
        <h3 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
          7-Day Platform Activity Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-gray-150 bg-slate-50/50 flex flex-col justify-between">
            <div className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">User Logins</div>
            <div className="text-3xl font-extrabold text-blue-600 mt-2">
              {isMonitoringLoading ? "--" : (stats?.userActivityStats?.loginsLast7Days ?? 0)}
            </div>
            <span className="text-[11px] font-bold text-slate-400 mt-1">Successful platform sessions in the last 7 days</span>
          </div>

          <div className="p-5 rounded-2xl border border-gray-150 bg-slate-50/50 flex flex-col justify-between">
            <div className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Export Cases Created</div>
            <div className="text-3xl font-extrabold text-purple-600 mt-2">
              {isMonitoringLoading ? "--" : (stats?.userActivityStats?.casesCreatedLast7Days ?? 0)}
            </div>
            <span className="text-[11px] font-bold text-slate-400 mt-1">New export management folders initialized</span>
          </div>

          <div className="p-5 rounded-2xl border border-gray-150 bg-slate-50/50 flex flex-col justify-between">
            <div className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">AI Recommendation Queries</div>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">
              {isMonitoringLoading ? "--" : (stats?.aiUsageCount ?? 0)}
            </div>
            <span className="text-[11px] font-bold text-slate-400 mt-1">AI Advisor recommendations generated</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link href="/company-approvals" className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-[#4B5563]">Company Approvals</span>
          </Link>
          <Link href="/users" className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center text-[#00A651] group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-[#4B5563]">User Management</span>
          </Link>
          <Link href="/system-monitoring" className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-[#4B5563]">System Monitoring</span>
          </Link>
          <Link href="/audit-logs" className="flex items-center gap-4 p-5 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-[#4B5563]">Audit Logs</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Recent Pending Applications */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-full inline-block"></span>
              Recent Pending Applications
            </h3>
            <Link href="/company-approvals" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1">
            {isApplicationsLoading ? (
              <div className="flex justify-center items-center h-32 font-bold text-[#4B5563]">Loading applications...</div>
            ) : pendingApplications.length > 0 ? (
              <div className="space-y-4">
                {pendingApplications.map((app, idx) => (
                  <div key={app.companyId || `app-${idx}`} className="flex items-center justify-between p-5 rounded-2xl border border-white bg-white/50 shadow-sm hover:shadow-md hover:bg-white transition-all">
                    <div>
                      <h4 className="font-extrabold text-[#1F2937]">{app.companyName}</h4>
                      <p className="text-sm font-semibold text-[#4B5563] mt-1">Applicant: <span className="font-medium">{app.applicant?.email}</span></p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs font-bold text-[#4B5563] mb-2">{new Date(app.submittedAt).toLocaleDateString()}</p>
                      <Link href={`/company-approvals/${app.companyId}`}>
                        <Button size="sm" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold tracking-widest uppercase text-xs h-8 px-4 rounded-lg">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm font-bold text-[#4B5563]">No pending applications.</p>
                <p className="text-xs font-semibold text-[#4B5563] mt-1">You are all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity (Audit Logs) */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
              Recent Activity
            </h3>
            <Link href="/audit-logs" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1">
            {isAuditLoading ? (
              <div className="flex justify-center items-center h-32 font-bold text-[#4B5563]">Loading activity...</div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log, idx) => (
                  <div key={log.id || `log-${idx}`} className="flex gap-4 p-4 rounded-2xl bg-white/50 border border-white shadow-sm hover:shadow-md hover:bg-white transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#1F2937]">
                        <span className="font-extrabold capitalize">{log.action.replace(/_/g, ' ')}</span> on <span className="font-bold text-[#00A651]">{log.resource}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#4B5563] font-bold">User: {log.actorId}</span>
                        <span className="text-xs text-[#4B5563]">•</span>
                        <span className="text-xs font-semibold text-[#4B5563]">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm font-bold text-[#4B5563]">No recent activity available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
