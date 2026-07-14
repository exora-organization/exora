"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Activity } from "lucide-react";

export default function AuditLogsPage() {
  const [limit, setLimit] = useState(50);
  const { firebaseUser, loading: authLoading } = useUserProfile();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-audit-logs", limit],
    queryFn: () => apiAdmin.getAuditLogs(limit),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  const logs = data?.data?.auditLogs || [];

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "admin_action":
        return "bg-blue-100 text-blue-800";
      case "login":
      case "approve":
        return "bg-green-100 text-green-800";
      case "reject":
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionDotColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "admin_action":
        return "bg-blue-500";
      case "login":
      case "approve":
        return "bg-green-500";
      case "reject":
      case "delete":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Audit Logs</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Review system activities, user operations, and security events.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-2xl border border-white/60 shadow-md bg-white/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
          >
            <option value={20}>20 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
          <Button 
            onClick={() => refetch()} 
            className="bg-[#00A651] hover:bg-[#008F44] text-white px-6 py-6 rounded-2xl shadow-md hover:shadow-lg font-bold transition-all disabled:opacity-50"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>
      ) : error ? (
        <div className="p-16 text-center text-red-500 font-bold">{(error as any)?.message || "Failed to load system audit logs."}</div>
      ) : logs.length === 0 ? (
        <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
          No logs found.
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
              
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 hidden md:flex">
                <Activity className="w-6 h-6" />
              </div>
              
              <div className="flex-[1.5] min-w-[150px]">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Action</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${getActionBadgeColor(log.action)}`}>
                  <span className={`w-2 h-2 rounded-full ${getActionDotColor(log.action)}`}></span>
                  {log.action.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Actor</p>
                <p className="text-sm font-extrabold text-[#1F2937]">{log.actorId || "System"}</p>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Resource</p>
                <p className="text-xs font-bold text-[#00A651] bg-[#EBF8F2] px-3 py-1.5 rounded-lg inline-block font-mono">{log.resource}</p>
              </div>

              <div className="flex-[2] max-w-sm hidden lg:block">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Details</p>
                <p className="text-xs font-medium text-[#4B5563] truncate">
                  {log.details ? JSON.stringify(log.details) : "-"}
                </p>
              </div>

              <div className="flex flex-col items-end md:ml-4">
                <p className="text-xs font-extrabold text-[#4B5563]">
                  {new Date(log.timestamp).toLocaleDateString()}
                </p>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
