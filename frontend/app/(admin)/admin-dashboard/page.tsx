"use client";

import * as React from "react";
import { Search, Building, Users, Activity, FileText, ArrowRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
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
    <div className="space-y-10 text-[#1F2937] relative pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-[#9CA3AF] font-medium mt-1">Platform Overview</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search data..." 
            className="w-full pl-4 pr-10 py-2.5 rounded-full border-none shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white text-sm"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.pendingApprovals ?? 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalCompanies ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalUsers ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#9CA3AF] flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Total Export Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#1F2937]">
              {isMonitoringLoading ? "--" : (stats?.totalExportCases ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/company-approvals" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-white hover:border-[#00A651]/30 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-[#4B5563]">Company Approvals</span>
          </Link>
          <Link href="/users" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-white hover:border-[#00A651]/30 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#EBF8F2] flex items-center justify-center text-[#00A651] group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-[#4B5563]">User Management</span>
          </Link>
          <Link href="/system-monitoring" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-white hover:border-[#00A651]/30 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-[#4B5563]">System Monitoring</span>
          </Link>
          <Link href="/audit-logs" className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-white hover:border-[#00A651]/30 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm text-[#4B5563]">Audit Logs</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Recent Pending Applications */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1F2937]">Recent Pending Applications</h3>
            <Link href="/company-approvals" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1">
            {isApplicationsLoading ? (
              <div className="flex justify-center items-center h-32 text-sm text-[#9CA3AF]">Loading applications...</div>
            ) : pendingApplications.length > 0 ? (
              <div className="space-y-4">
                {pendingApplications.map((app, idx) => (
                  <div key={app.companyId || `app-${idx}`} className="flex items-center justify-between p-4 rounded-xl border border-[#D1EDE4] bg-[#EBF8F2]/50 hover:bg-[#EBF8F2] transition-colors">
                    <div>
                      <h4 className="font-bold text-[#1F2937] text-sm">{app.companyName}</h4>
                      <p className="text-xs text-[#9CA3AF] mt-1">Applicant: {app.applicant?.email} • {new Date(app.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/company-approvals/${app.companyId}`}>
                      <Button size="sm" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold text-xs h-8">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm font-medium text-[#9CA3AF]">No pending applications.</p>
                <p className="text-xs text-[#9CA3AF] mt-1">You are all caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity (Audit Logs) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-white/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1F2937]">Recent Activity</h3>
            <Link href="/audit-logs" className="text-sm font-bold text-[#00A651] hover:text-[#008F44] flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1">
            {isAuditLoading ? (
              <div className="flex justify-center items-center h-32 text-sm text-[#9CA3AF]">Loading activity...</div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log, idx) => (
                  <div key={log.id || `log-${idx}`} className="flex gap-4 p-3 rounded-xl hover:bg-[#EBF8F2] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#EBF8F2] flex items-center justify-center text-[#9CA3AF] shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-[#1F2937]">
                        <span className="font-bold capitalize">{log.action.replace(/_/g, ' ')}</span> on <span className="font-medium text-[#4B5563]">{log.resource}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#00A651] font-medium">{log.actorId}</span>
                        <span className="text-xs text-[#9CA3AF]">•</span>
                        <span className="text-xs text-[#9CA3AF]">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm font-medium text-[#9CA3AF]">No recent activity available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
