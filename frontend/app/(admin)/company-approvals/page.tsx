"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function CompanyApprovalsPage() {
  const { firebaseUser, loading: authLoading } = useUserProfile();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

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

  const applications = data?.data?.items || [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Company Approvals</h2>
        <p className="text-[#4B5563] mt-2 font-medium">Review and manage registration requests from export companies.</p>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
            No applications found.
          </div>
        ) : (
          applications.map((app) => (
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
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
                  app.status === "pending" ? "bg-amber-100 text-amber-700" : 
                  app.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    app.status === "pending" ? "bg-amber-500" : 
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
                <Link href={`/company-approvals/${app.companyId}`}>
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
