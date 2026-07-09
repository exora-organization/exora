"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAdmin } from "../../../lib/api/admin";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";

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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "login":
      case "approve":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "reject":
      case "delete":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-[#F5F8F6] text-[#1F2937] border-[#E8E3D9]";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1F2937]">Audit Logs</h2>
          <p className="text-[#9CA3AF] mt-1">Review system activities, user operations, and security events.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded-md border border-[#E8E3D9] bg-white px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={20}>20 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="text-[#4B5563] hover:text-[#1F2937]"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-[#9CA3AF]">Loading audit logs...</div>
      ) : error ? (
        <div className="p-16 text-center text-rose-500">{(error as any)?.message || "Failed to load system audit logs."}</div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-[#E8E3D9] bg-[#FAF8F3]/20">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#F5F8F6] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-[#4B5563]">No logs found</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">
              There are no audit logs recorded in the system yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E8E3D9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#4B5563]">
              <thead className="bg-[#FAF8F3] text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-[#E8E3D9]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-[#9CA3AF]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1F2937] text-xs">
                      {log.actorId || "System"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={`${getActionBadgeColor(log.action)} capitalize`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[#2F6B4F]">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#9CA3AF] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
