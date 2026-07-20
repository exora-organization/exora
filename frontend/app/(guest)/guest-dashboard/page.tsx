"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiCompany } from "../../../lib/api/company";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  Building2,
} from "lucide-react";

type ApplicationStatus = "pending" | "approved" | "rejected" | "revision_requested";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    bg: string;
    border: string;
    badge: string;
    badgeText: string;
    textColor: string;
  }
> = {
  pending: {
    icon: <Clock className="w-10 h-10 text-amber-500" />,
    label: "Under Review",
    description:
      "Your company application has been submitted and is currently being reviewed by the EXORA admin team. You will be notified once a decision is made.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    badgeText: "PENDING",
    textColor: "text-amber-800",
  },
  approved: {
    icon: <CheckCircle className="w-10 h-10 text-emerald-500" />,
    label: "Approved",
    description:
      "Congratulations — your application has been approved! Refresh your session to access the full Company Owner dashboard.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    badgeText: "APPROVED",
    textColor: "text-emerald-800",
  },
  rejected: {
    icon: <XCircle className="w-10 h-10 text-rose-500" />,
    label: "Rejected",
    description:
      "Your application was not approved at this time. Please contact support for further assistance.",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    badgeText: "REJECTED",
    textColor: "text-rose-800",
  },
  revision_requested: {
    icon: <AlertTriangle className="w-10 h-10 text-amber-600" />,
    label: "Revision Required",
    description:
      "The admin has requested changes to your application. Review the notes below and resubmit.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-900",
    badgeText: "REVISION NEEDED",
    textColor: "text-amber-900",
  },
};

export default function GuestDashboardPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["application-status"],
    queryFn: () => apiCompany.getApplicationStatus(),
    retry: false,
  });

  const appData = data?.data;
  const status = appData?.status as ApplicationStatus | undefined;
  const cfg = status ? STATUS_CONFIG[status] : null;

  return (
    <div className="space-y-10 max-w-3xl mx-auto pb-12">

      {/* Page Header */}
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Welcome to EXORA</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Track your company application status and manage your submission here.
        </p>
      </div>

      {/* Application Status Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-[#F3F4F6]">
          <h3 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <span className="w-2 h-5 bg-[#00A651] rounded-full" />
            Application Status
          </h3>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
            </div>
          ) : !appData ? (
            /* No application yet */
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#EBF8F2] flex items-center justify-center">
                <Building2 className="w-10 h-10 text-[#00A651]" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#1F2937] mb-1">No Application Submitted</p>
                <p className="text-sm text-[#6B7280] font-medium">
                  You haven&apos;t submitted a company application yet. Get started to access all EXORA features.
                </p>
              </div>
              <Link
                href="/company-application"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <FileText className="w-4 h-4" /> Submit Application
              </Link>
            </div>
          ) : cfg ? (
            /* Status card */
            <div className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-5">
                <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <p className={`text-lg font-extrabold ${cfg.textColor}`}>{cfg.label}</p>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.badge}`}>
                      {cfg.badgeText}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#4B5563] leading-relaxed">{cfg.description}</p>

                  {/* Revision notes */}
                  {status === "revision_requested" && appData.revisionNotes && (
                    <div className="mt-4 p-4 bg-white/60 rounded-xl border border-amber-200">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Admin Notes</p>
                      <p className="text-sm font-semibold text-[#4B5563]">{appData.revisionNotes}</p>
                    </div>
                  )}

                  {/* Company info preview */}
                  {(appData.companyName || appData.businessSector) && (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {appData.companyName && (
                        <div className="bg-white/60 rounded-xl px-4 py-3 border border-white/80">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#9CA3AF]">Company</p>
                          <p className="text-sm font-extrabold text-[#1F2937] mt-0.5 truncate">{appData.companyName}</p>
                        </div>
                      )}
                      {appData.businessSector && (
                        <div className="bg-white/60 rounded-xl px-4 py-3 border border-white/80">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#9CA3AF]">Sector</p>
                          <p className="text-sm font-extrabold text-[#1F2937] mt-0.5 truncate">{appData.businessSector}</p>
                        </div>
                      )}
                      {appData.country && (
                        <div className="bg-white/60 rounded-xl px-4 py-3 border border-white/80">
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#9CA3AF]">Country</p>
                          <p className="text-sm font-extrabold text-[#1F2937] mt-0.5 truncate">{appData.country}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
        <h3 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2 mb-5">
          <span className="w-2 h-5 bg-[#00A651] rounded-full" />
          Quick Actions
        </h3>
        <div className="grid gap-3">
          <Link
            href="/company-application"
            className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E3D9] bg-[#F9FAFB] hover:bg-white hover:shadow-md hover:border-[#00A651]/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#00A651]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#1F2937]">
                  {!appData ? "Submit Application" : "Edit Application"}
                </p>
                <p className="text-xs text-[#9CA3AF] font-medium">
                  {!appData
                    ? "Register your company to get started"
                    : status === "revision_requested"
                    ? "Revisions required — click to resubmit"
                    : "Update your company application details"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/application-status"
            className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E3D9] bg-[#F9FAFB] hover:bg-white hover:shadow-md hover:border-[#00A651]/40 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#00A651]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#1F2937]">Application Status Tracker</p>
                <p className="text-xs text-[#9CA3AF] font-medium">Full status detail with revision form if needed</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
          </Link>

          {status === "pending" && (
            <button
              onClick={() => refetch()}
              className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E3D9] bg-[#F9FAFB] hover:bg-white hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#1F2937]">Refresh Status</p>
                  <p className="text-xs text-[#9CA3AF] font-medium">Check if admin has reviewed your application</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#00A651] group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {status === "approved" && (
            <button
              onClick={async () => {
                const { auth } = await import("../../../lib/firebase/client");
                if (auth.currentUser) {
                  await auth.currentUser.reload();
                  await auth.currentUser.getIdToken(true);
                }
                window.location.href = "/owner-dashboard";
              }}
              className="flex items-center justify-between p-4 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-emerald-800">Go to Owner Dashboard</p>
                  <p className="text-xs text-emerald-600 font-medium">Your application is approved — access your dashboard</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
