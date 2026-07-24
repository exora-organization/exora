"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo } from "react";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Icon } from "@iconify/react";

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  const allApplications = data?.data?.items || [];

  const filtered = useMemo(() => {
    let arr = [...allApplications];

    // Search
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

    // Status
    if (statusFilter !== "all") {
      arr = arr.filter((a) => a.status === statusFilter);
    }

    // Sort
    arr.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sortBy === "oldest") return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      if (sortBy === "name_asc") return (a.companyName || "").localeCompare(b.companyName || "");
      if (sortBy === "name_desc") return (b.companyName || "").localeCompare(a.companyName || "");
      return 0;
    });

    return arr;
  }, [allApplications, search, statusFilter, sortBy]);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 font-bold">
        <p className="text-red-500">Failed to load applications.</p>
        <Button onClick={() => refetch()} className="bg-red-100 text-red-700 hover:bg-red-200">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Company Applications</h2>
          <p className="text-[#4B5563] mt-2 font-medium">Review and manage registration requests from export companies.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-[#00A651] text-[#00A651] hover:bg-[#EBF8F2] rounded-xl font-bold h-10 px-6 self-start sm:self-auto">
          Refresh
        </Button>
      </div>

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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === tab.value
                ? "bg-[#00A651] text-white shadow-md"
                : "bg-white border border-[#E8E3D9] text-[#6B7280] hover:border-[#00A651]/40 hover:text-[#00A651]"
                }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${statusFilter === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
            No applications match your filters.
          </div>
        ) : (
          filtered.map((app) => (
            <div key={app.companyId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">

              {/* Company Info */}
              <div className="flex-[2] min-w-[200px]">
                <h4 className="text-xl font-extrabold text-[#1F2937]">{app.companyName}</h4>
                <p className="text-sm font-semibold text-[#4B5563] mt-1">Applicant: {app.applicant?.email || "Unknown"}</p>
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
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${app.status === "pending" ? "bg-blue-100 text-blue-700" :
                  app.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${app.status === "pending" ? "bg-blue-500" :
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
  );
}
