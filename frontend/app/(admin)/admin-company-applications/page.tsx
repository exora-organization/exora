"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo } from "react";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ProfileChangeResponse } from "../../../lib/types/company";
import { notificationStore } from "../../../lib/services/notificationStore";


const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Revision", value: "revision_requested" },
] as const;

const SORT_OPTIONS = [
  { label: "Newest Submitted", value: "newest" },
  { label: "Oldest Submitted", value: "oldest" },
  { label: "Company A → Z", value: "name_asc" },
  { label: "Company Z → A", value: "name_desc" },
] as const;

export default function CompanyApplicationsPage() {
  const { firebaseUser, loading: authLoading } = useUserProfile();
  const queryClient = useQueryClient();

  const [activeMainTab, setActiveMainTab] = useState<"applications" | "change_requests">("applications");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Rejection modal state for change requests
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Registration applications query
  const { data: appData, isLoading: appLoading, error: appError, refetch: refetchApps } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  // Change requests query
  const { data: changeReqData, isLoading: changeReqLoading, refetch: refetchChangeReqs } = useQuery({
    queryKey: ["admin-change-requests"],
    queryFn: () => apiAdmin.getCompanyChangeRequests(),
    enabled: !!firebaseUser && !authLoading,
  });

  const allApplications = appData?.data?.items || [];
  const changeRequests = changeReqData?.data?.items || [];

  // Approve Change Request Mutation
  const approveChangeMut = useMutation({
    mutationFn: (requestId: string) => apiAdmin.approveChangeRequest(requestId),
    onSuccess: (res, requestId) => {
      toast.success("Profile change request approved! Company data updated automatically.");
      const req = changeRequests.find((r) => r.id === requestId);
      if (req) {
        notificationStore.addNotification({
          caseId: req.companyId,
          caseName: req.after?.companyName || "Company",
          message: `Company profile change request for '${req.after?.companyName}' was APPROVED by Admin.`,
          targetRole: "company_owner",
          targetTab: "company_profile",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["owner-change-request-notification"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to approve change request.");
    },
  });

  // Reject Change Request Mutation
  const rejectChangeMut = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      apiAdmin.rejectChangeRequest(requestId, reason),
    onSuccess: (res, { requestId, reason }) => {
      toast.success("Profile change request rejected.");
      const req = changeRequests.find((r) => r.id === requestId);
      if (req) {
        notificationStore.addNotification({
          caseId: req.companyId,
          caseName: req.before?.companyName || "Company",
          message: `Company profile change request for '${req.before?.companyName}' was REJECTED by Admin. Reason: "${reason}"`,
          targetRole: "company_owner",
          targetTab: "company_profile",
        });
      }
      setRejectingRequestId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["owner-change-request-notification"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject change request.");
    },
  });


  const filtered = useMemo(() => {
    let arr = [...allApplications];

    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (a) =>
          a.companyName?.toLowerCase().includes(q) ||
          a.applicant?.email?.toLowerCase().includes(q) ||
          a.businessSector?.toLowerCase().includes(q) ||
          a.country?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      arr = arr.filter((a) => a.status === statusFilter);
    }

    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sortBy === "oldest") return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      if (sortBy === "name_asc") return (a.companyName || "").localeCompare(b.companyName || "");
      if (sortBy === "name_desc") return (b.companyName || "").localeCompare(a.companyName || "");
      return 0;
    });

    return arr;
  }, [allApplications, search, statusFilter, sortBy]);

  if (appLoading || changeReqLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div></div>;
  }

  if (appError) {
    return (
      <div className="p-8 text-center space-y-4 font-bold">
        <p className="text-red-500">Failed to load applications.</p>
        <Button onClick={() => refetchApps()} className="bg-red-100 text-red-700 hover:bg-red-200">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Company Management</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Review initial registration applications and profile change requests.</p>
        </div>
        <Button
          onClick={() => {
            refetchApps();
            refetchChangeReqs();
          }}
          variant="outline"
          className="border-[#00A651] text-[#00A651] hover:bg-[#EBF8F2] rounded-xl font-bold h-10 px-6 self-start sm:self-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveMainTab("applications")}
          className={`pb-4 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeMainTab === "applications"
              ? "border-[#00A651] text-[#00A651]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Icon icon="solar:folder-with-files-bold-duotone" className="w-5 h-5" />
          Registration Applications
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-black">
            {allApplications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("change_requests")}
          className={`pb-4 font-extrabold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeMainTab === "change_requests"
              ? "border-[#00A651] text-[#00A651]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
          Profile Change Requests
          {changeRequests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800 font-black">
              {changeRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: REGISTRATION APPLICATIONS */}
      {activeMainTab === "applications" && (
        <div className="space-y-6">
          {/* Search & Sort Bar */}
          <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-sm p-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
              <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
                placeholder="Search by company, email, sector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:slider-horizontal-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto text-xs font-bold text-[#9CA3AF] uppercase tracking-widest shrink-0">
              {filtered.length} of {allApplications.length}
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const count = tab.value === "all"
                ? allApplications.length
                : allApplications.filter((a) => a.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === tab.value
                      ? "bg-[#00A651] text-white shadow-md"
                      : "bg-white border border-[#E8E3D9] text-[#6B7280] hover:border-[#00A651]/40 hover:text-[#00A651]"
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    statusFilter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
                No applications match your filters.
              </div>
            ) : (
              filtered.map((app) => (
                <div key={app.companyId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
                  <div className="flex-[2] min-w-[200px]">
                    <h4 className="text-xl font-extrabold text-[#1F2937]">{app.companyName}</h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {app.applicant?.displayName === "Deleted User" || (!app.applicant?.displayName && !app.applicant?.email) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200">
                          🗑 Deleted User
                        </span>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-[#4B5563]">
                            {app.applicant?.displayName || app.applicant?.email || "Unknown"}
                          </span>
                          {app.applicant?.email && app.applicant?.displayName && (
                            <span className="text-xs text-[#9CA3AF]">({app.applicant.email})</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sector */}
                  <div className="flex-1 hidden md:block">
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Sector</p>
                    <p className="text-sm font-bold text-[#4B5563]">{app.businessSector || "-"}</p>
                  </div>

                  {/* Country */}
                  <div className="flex-1 hidden md:block">
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Country</p>
                    <p className="text-sm font-bold text-[#4B5563]">{app.country || "-"}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
                      app.status === "pending" ? "bg-blue-100 text-blue-700" :
                      app.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        app.status === "pending" ? "bg-blue-500" :
                        app.status === "approved" ? "bg-green-500" : "bg-red-500"
                      }`}></span>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Date & Actions */}
                  <div className="flex flex-col items-end gap-2 md:ml-4">
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                    <Link href={`/admin-company-applications/${app.companyId}`}>
                      <Button size="sm" className="bg-[#EBF8F2] text-[#00A651] hover:bg-[#00A651] hover:text-white border border-[#00A651]/20 font-bold uppercase tracking-widest text-xs px-6 rounded-xl transition-all shadow-sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE CHANGE REQUESTS */}
      {activeMainTab === "change_requests" && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-sm font-semibold">
            <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-amber-600 shrink-0" />
            Review side-by-side (Before vs After) changes submitted by Company Owners. Approving automatically updates the company record.
          </div>

          {changeRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-500 font-bold">
              <Icon icon="solar:check-circle-bold-duotone" className="w-12 h-12 text-[#00A651] mx-auto mb-3" />
              No pending profile change requests.
            </div>
          ) : (
            <div className="space-y-6">
              {changeRequests.map((req: ProfileChangeResponse) => (
                <div key={req.id} className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 space-y-6">
                  {/* Header info */}
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-[#00A651] bg-[#EBF8F2] px-2.5 py-1 rounded-lg">
                          Company ID: {req.companyId}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Requested: {new Date(req.requestedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      {req.reason && (
                        <p className="text-sm text-slate-600 mt-2 font-medium italic">
                          "<span className="font-semibold text-slate-800">{req.reason}</span>"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => approveChangeMut.mutate(req.id)}
                        disabled={approveChangeMut.isPending}
                        className="bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold px-5 h-10 rounded-xl shadow-md transition-all"
                      >
                        <Icon icon="solar:check-circle-bold" className="w-4 h-4 mr-1.5" />
                        Approve & Apply
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectingRequestId(req.id);
                          setRejectReason("");
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-5 h-10 rounded-xl transition-colors"
                      >
                        <Icon icon="solar:close-circle-bold" className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {/* BEFORE VS AFTER SIDE-BY-SIDE COMPARISON */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before Card */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                          <Icon icon="solar:history-bold" className="w-4 h-4" />
                          Current Profile (Before)
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</p>
                          <p className="text-sm font-bold text-slate-800">{req.before?.companyName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Sector</p>
                          <p className="text-sm font-bold text-slate-800">{req.before?.businessSector || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Country</p>
                          <p className="text-sm font-bold text-slate-800">{req.before?.country || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* After Card */}
                    <div className="bg-[#EBF8F2]/60 rounded-2xl p-5 border border-[#00A651]/30 space-y-4 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-[#00A651]/20 pb-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#00A651] flex items-center gap-1.5">
                          <Icon icon="solar:pen-new-square-bold" className="w-4 h-4" />
                          Proposed Profile (After)
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#00A651] text-white px-2 py-0.5 rounded-full">
                          New Data
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-[#00A651]/70 uppercase tracking-widest">Company Name</p>
                          <p className={`text-sm font-black ${
                            req.before?.companyName !== req.after?.companyName
                              ? "text-[#00A651] underline decoration-[#00A651]/40"
                              : "text-slate-800"
                          }`}>
                            {req.after?.companyName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#00A651]/70 uppercase tracking-widest">Business Sector</p>
                          <p className={`text-sm font-black ${
                            req.before?.businessSector !== req.after?.businessSector
                              ? "text-[#00A651] underline decoration-[#00A651]/40"
                              : "text-slate-800"
                          }`}>
                            {req.after?.businessSector || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#00A651]/70 uppercase tracking-widest">Country</p>
                          <p className={`text-sm font-black ${
                            req.before?.country !== req.after?.country
                              ? "text-[#00A651] underline decoration-[#00A651]/40"
                              : "text-slate-800"
                          }`}>
                            {req.after?.country || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECTION MODAL FOR CHANGE REQUEST */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/80 max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900">Reject Profile Change Request</h3>
            <p className="text-xs text-slate-500 font-medium">Please provide a reason for rejecting this change request.</p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 font-semibold text-sm resize-none"
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectingRequestId(null)}
                className="flex-1 rounded-xl font-bold h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error("Please enter a reason for rejection.");
                    return;
                  }
                  rejectChangeMut.mutate({ requestId: rejectingRequestId, reason: rejectReason });
                }}
                disabled={rejectChangeMut.isPending}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold h-11"
              >
                {rejectChangeMut.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
