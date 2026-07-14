"use client";

import * as React from "react";
import { Search, Building, Users, Activity, FileText, ArrowRight, Clock, Building2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";

export default function AdminDashboardPage() {
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
  const pendingApplications = applicationsData?.data?.items
    ?.filter(app => app.status === "pending")
    ?.slice(0, 5) || [];

  const recentLogs = auditData?.data?.auditLogs || [];

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
            placeholder="Search data..." 
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/60 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white/90 backdrop-blur-md text-sm font-medium"
          />
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Pending Approvals</h3>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.pendingApprovals ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 shrink-0"></span>
            Applications awaiting review
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Companies</h3>
            <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#00A651]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalCompanies ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-[#00A651] mr-2 shrink-0"></span>
            Registered on EXORA
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Users</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalUsers ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shrink-0"></span>
            Across all roles
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative group transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-widest mt-2">Total Export Cases</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-5xl font-extrabold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalExportCases ?? 0)}
            </div>
          </div>
          <div className="flex items-center text-sm font-semibold text-[#4B5563]">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2 shrink-0"></span>
            Managed in the system
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
