"use client";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAdmin } from "../../../lib/api/admin";
import { HeaderNotificationCenter } from "../../../components/navigation/HeaderNotificationCenter";

const QUICK_LINKS = [
  { name: "Company Applications Queue", href: "/admin-company-applications", icon: "solar:buildings-bold-duotone", keywords: ["company", "application", "queue", "pending", "verification", "approve", "reject", "review"] },
  { name: "User Management", href: "/admin-users", icon: "solar:users-group-rounded-bold-duotone", keywords: ["user", "users", "management", "roles", "admin"] },
  { name: "Audit Logs & Anomalies", href: "/admin-audit-logs", icon: "solar:shield-warning-bold-duotone", keywords: ["audit", "log", "logs", "security", "anomalies", "activity", "error"] },
  { name: "System Monitoring", href: "/admin-system-monitoring", icon: "solar:chart-square-bold-duotone", keywords: ["system", "monitoring", "health", "uptime", "stats", "server"] },
  { name: "AI Advisor", href: "/admin-ai-advisor", icon: "solar:cpu-bolt-bold-duotone", keywords: ["ai", "advisor", "settings", "bot", "assistant"] },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { data: monitoringData, isLoading: isMonitoringLoading } = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: () => apiAdmin.getMonitoring(),
    staleTime: 60_000,
  });

  const { data: applicationsData, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    staleTime: 60_000,
  });

  const { data: auditData } = useQuery({
    queryKey: ["admin-audit-logs", 50],
    queryFn: () => apiAdmin.getAuditLogs(50),
    staleTime: 60_000,
  });

  const stats = monitoringData?.data;

  const allPendingApplications = useMemo(() => {
    return applicationsData?.data?.items?.filter((app) => app.status === "pending") || [];
  }, [applicationsData]);

  const allLogs = auditData?.data?.auditLogs || [];
  const anomalyLogs = useMemo(() => {
    return allLogs.filter((log: any) => {
      const act = (log.action || "").toLowerCase();
      return act.includes("fail") || act.includes("delete") || act.includes("reject") || act.includes("unauthorized");
    });
  }, [allLogs]);

  const filteredQuickLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return QUICK_LINKS;
    return QUICK_LINKS.filter((link) => 
      link.name.toLowerCase().includes(q) || 
      link.keywords.some(k => k.includes(q))
    );
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (filteredQuickLinks.length > 0) {
        router.push(filteredQuickLinks[0].href);
      }
    }
  };

  return (
    <div className="space-y-8 text-[#1F2937] pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">System Admin Dashboard</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">
            Global Tenant Management &amp; Operational Action Queue
          </p>
        </div>

        <div className="flex items-center gap-4">
          <HeaderNotificationCenter />
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

      {/* SEARCH BAR — Compact width positioned directly above System Uptime */}
      <div className="relative w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search quick links..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-white/60 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white/90 backdrop-blur-md text-xs font-semibold text-[#1F2937] placeholder-gray-400"
          />
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3.5 top-3 h-4 w-4 text-[#00A651]" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Links Search Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full mt-2 w-full min-w-[320px] bg-white border border-[#E8E3D9] rounded-2xl shadow-xl overflow-hidden z-50 p-2">
            <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Icon icon="solar:bolt-bold-duotone" className="w-3.5 h-3.5 text-[#00A651]" />
              Quick Links ({filteredQuickLinks.length})
            </p>
            {filteredQuickLinks.length === 0 ? (
              <div className="px-3 py-3 text-xs font-semibold text-gray-400">
                No quick links matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredQuickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#EBF8F2] transition-colors group border border-transparent hover:border-[#00A651]/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-[#00A651]/10 group-hover:text-[#00A651] text-gray-400 transition-colors shrink-0">
                      <Icon icon={link.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#1F2937] group-hover:text-[#00A651] transition-colors truncate">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Health Snapshot & Active Tenants (System Uptime) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">System Uptime (24h)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-2xl font-black text-emerald-600">99.98%</p>
          <p className="text-[11px] text-gray-500 font-medium">All API services operational</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Error Rate (24h)</span>
            <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[#1F2937]">0.02%</p>
          <p className="text-[11px] text-gray-500 font-medium">Within nominal threshold</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Active Tenants</span>
            <Icon icon="solar:buildings-bold-duotone" className="w-4 h-4 text-[#00A651]" />
          </div>
          <p className="text-2xl font-black text-[#00A651]">
            {isMonitoringLoading ? "--" : stats?.totalCompanies ?? 14}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">+12% MoM growth trend</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-5 hover:shadow-xl transition-all space-y-2">
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
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:shadow-2xl transition-all space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
              Applications Awaiting Verification
            </h4>
            <Link href="/admin-company-applications" className="text-xs font-bold text-[#00A651] hover:underline">
              View All Queue ({allPendingApplications.length})
            </Link>
          </div>

          {allPendingApplications.length === 0 ? (
            <div className="text-center py-8 text-xs font-bold text-gray-400">
              No pending applications in queue right now.
            </div>
          ) : (
            <div className="space-y-3">
              {allPendingApplications.slice(0, 5).map((app, idx) => (
                <div key={app.companyId || idx} className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#E8E3D9] flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-extrabold text-[#1F2937]">{app.companyName}</h5>
                    <p className="text-xs text-[#6B7280]">
                      Applicant:{" "}
                      {app.applicant?.displayName === "Deleted User" || (!app.applicant?.displayName && !app.applicant?.email)
                        ? "Deleted User"
                        : app.applicant?.displayName || app.applicant?.email || app.companyName}
                    </p>
                  </div>
                  <Link href={`/admin-company-applications/${app.companyId}`}>
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
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:shadow-2xl transition-all space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Icon icon="solar:shield-warning-bold-duotone" className="w-5 h-5 text-rose-500" />
              Security Anomalies &amp; Audit Log
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
