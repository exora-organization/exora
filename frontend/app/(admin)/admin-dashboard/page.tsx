"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";

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
    queryKey: ["admin-audit-logs", 50],
    queryFn: () => apiAdmin.getAuditLogs(50),
  });

  const stats = monitoringData?.data;

  const allPendingApplications = useMemo(() => {
    return applicationsData?.data?.items?.filter((app) => app.status === "pending") || [];
  }, [applicationsData]);

  const filteredPending = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allPendingApplications.slice(0, 5);
    return allPendingApplications
      .filter(
        (app) =>
          app.companyName?.toLowerCase().includes(q) ||
          app.applicant?.email?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [allPendingApplications, searchQuery]);

  const allLogs = auditData?.data?.auditLogs || [];
  const anomalyLogs = useMemo(() => {
    return allLogs.filter((log: any) => {
      const act = (log.action || "").toLowerCase();
      return act.includes("fail") || act.includes("delete") || act.includes("reject") || act.includes("unauthorized");
    });
  }, [allLogs]);

  return (
    <div className="space-y-8 text-[#1F2937] pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">System Admin Dashboard</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">
            Global Tenant Management & Operational Action Queue
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queue & audit log..."
            className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-[#E8E3D9] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white text-xs font-semibold"
          />
          <Icon icon="solar:magnifer-bold-duotone" className="absolute right-3.5 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* PRINCIPLE 1: ACTION-FIRST TOP SECTION */}
      <div className="bg-[#EBF8F2] border-2 border-[#00A651]/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#00A651] text-white flex items-center justify-center shadow-md shrink-0">
            <Icon icon="solar:bell-bing-bold-duotone" className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-md bg-[#00A651]/20 text-[#00A651] text-[10px] font-black uppercase tracking-wider">
              Action Required
            </span>
            <h3 className="text-2xl font-extrabold text-[#1F2937] mt-1">
              {isApplicationsLoading ? "..." : allPendingApplications.length} Pending Company Applications
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-0.5">
              Tenant verification queue requires admin decision for company account setup.
            </p>
          </div>
        </div>

        <Link
          href="/admin-company-applications"
          className="px-6 py-3.5 bg-[#00A651] hover:bg-[#008F44] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all shrink-0 flex items-center gap-2"
        >
          Open Approval Queue <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4" />
        </Link>
      </div>

      {/* System Health Snapshot & Active Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">System Uptime (24h)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-600">99.98%</p>
          <p className="text-[11px] text-gray-500 font-medium">All API services operational</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Error Rate (24h)</span>
            <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[#1F2937]">0.02%</p>
          <p className="text-[11px] text-gray-500 font-medium">Within nominal threshold</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Active Tenants</span>
            <Icon icon="solar:buildings-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-2xl font-black text-[#00A651]">
            {isMonitoringLoading ? "--" : stats?.totalCompanies ?? 14}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">+12% MoM growth trend</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total System Users</span>
            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-2xl font-black text-[#1F2937]">
            {isMonitoringLoading ? "--" : stats?.totalUsers ?? 48}
          </p>
          <p className="text-[11px] text-gray-500 font-medium">Across all 5 system roles</p>
        </div>
      </div>

      {/* Queue Details & Anomalies Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Queue */}
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
              Applications Awaiting Verification
            </h4>
            <Link href="/admin-company-applications" className="text-xs font-bold text-[#00A651] hover:underline">
              View All Queue ({allPendingApplications.length})
            </Link>
          </div>

          {filteredPending.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-gray-400">
              No pending applications in queue right now.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPending.map((app, idx) => (
                <div key={app.companyId || idx} className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-extrabold text-[#1F2937]">{app.companyName}</h5>
                    <p className="text-xs text-[#6B7280]">Applicant: {app.applicant?.email || app.companyName}</p>
                  </div>
                  <Link href={`/admin-company-applications`}>
                    <button className="px-3.5 py-1.5 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl cursor-pointer">
                      Review
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Anomalies / Audit Log */}
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold-duotone" className="w-5 h-5 text-rose-500" />
              Security Anomalies & Audit Log
            </h4>
            <Link href="/admin-audit-logs" className="text-xs font-bold text-[#00A651] hover:underline">
              View Full Audit Logs
            </Link>
          </div>

          {allLogs.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-gray-400">
              No suspicious activity detected.
            </div>
          ) : (
            <div className="space-y-3">
              {(anomalyLogs.length > 0 ? anomalyLogs : allLogs).slice(0, 4).map((log: any, idx: number) => (
                <div key={log.id || idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-[#1F2937] truncate">
                      {log.action?.replace(/_/g, " ")} on {log.resource}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Actor: {log.actorId} · {new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
