"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiCompany } from "../../../lib/api/company";
import { Icon } from "@iconify/react";

type ApplicationStatus = "none" | "pending" | "approved" | "rejected" | "revision_requested";

const STATUS_CONFIG: Record<
  Exclude<ApplicationStatus, "none">,
  {
    icon: string;
    label: string;
    description: string;
    bg: string;
    border: string;
    badge: string;
    badgeText: string;
    textColor: string;
    stepCompleted: number; // 1 to 4
  }
> = {
  pending: {
    icon: "solar:clock-circle-bold-duotone",
    label: "Under Review",
    description:
      "Your company registration application has been submitted and is currently being audited by the System Admin team.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    badgeText: "PENDING REVIEW",
    textColor: "text-amber-900",
    stepCompleted: 2,
  },
  approved: {
    icon: "solar:check-circle-bold-duotone",
    label: "Application Approved!",
    description:
      "Congratulations! Your company verification is complete. You can now access your full Company Owner workspace.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
    badgeText: "VERIFIED & APPROVED",
    textColor: "text-emerald-900",
    stepCompleted: 4,
  },
  rejected: {
    icon: "solar:close-circle-bold-duotone",
    label: "Application Rejected",
    description:
      "Your application did not pass verification. Please review the notes below and complete missing company credentials.",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-900 border-rose-300",
    badgeText: "REJECTED",
    textColor: "text-rose-900",
    stepCompleted: 2,
  },
  revision_requested: {
    icon: "solar:danger-triangle-bold-duotone",
    label: "Revision Required",
    description:
      "The System Admin requires additional documentation before approving your company account setup.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    badgeText: "REVISION REQUIRED",
    textColor: "text-amber-900",
    stepCompleted: 2,
  },
};

const TIMELINE_STEPS = [
  { step: 1, name: "Submission Received", desc: "Company details & documentation uploaded" },
  { step: 2, name: "Document Audit", desc: "Admin verification of business credentials" },
  { step: 3, name: "Admin Decision", desc: "Review & approval by system administrator" },
  { step: 4, name: "Tenant Account Setup", desc: "Access granted to Company Owner workspace" },
];

export default function GuestDashboardPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["application-status"],
    queryFn: () => apiCompany.getApplicationStatus(),
    retry: false,
  });

  const appData = data?.data;
  const status = appData?.status as ApplicationStatus | undefined;
  const cfg = status && status !== "none" ? STATUS_CONFIG[status] : null;
  const activeStep = cfg ? cfg.stepCompleted : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Registration Status Tracker</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Monitor your company verification progress step-by-step
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
        </div>
      ) : !appData || status === "none" ? (
        /* No application yet */
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF8F2] flex items-center justify-center mx-auto text-[#00A651]">
            <Icon icon="solar:buildings-bold-duotone" className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-[#1F2937]">No Company Application Submitted</h3>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              Submit your company credentials to get verified and unlock the full EXORA Export Management Platform.
            </p>
          </div>
          <Link
            href="/register-company"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" /> Submit Company Application
          </Link>
        </div>
      ) : cfg ? (
        /* Status Card & Verification Timeline */
        <div className="space-y-6">
          {/* Main Status Hero */}
          <div className={`rounded-3xl border p-6 md:p-8 ${cfg.bg} ${cfg.border} shadow-sm space-y-6`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                  <Icon icon={cfg.icon} className="w-7 h-7 text-current" />
                </div>
                <div>
                  <h3 className={`text-xl font-extrabold ${cfg.textColor}`}>{cfg.label}</h3>
                  <p className="text-xs font-semibold text-[#4B5563] mt-0.5 max-w-xl">{cfg.description}</p>
                </div>
              </div>
              <span className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${cfg.badge}`}>
                {cfg.badgeText}
              </span>
            </div>

            {/* Revision / Rejection Notes */}
            {(status === "revision_requested" || status === "rejected") && (
              <div className="p-4 bg-white rounded-2xl border border-amber-300 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">Admin Notes / Rejection Reason</p>
                <p className="text-xs font-semibold text-[#1F2937]">
                  {appData.revisionNotes || "Please verify your company legal documents and resubmit."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/register-company"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                  >
                    <Icon icon="solar:pen-new-square-bold-duotone" className="w-4 h-4" /> Complete Documents & Resubmit
                  </Link>
                </div>
              </div>
            )}

            {/* Approved CTA */}
            {status === "approved" && (
              <div className="p-4 bg-emerald-100/60 rounded-2xl border border-emerald-300 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs font-extrabold text-emerald-950">Verification Complete!</p>
                  <p className="text-[11px] font-semibold text-emerald-800">Continue to access your Company Owner dashboard.</p>
                </div>
                <button
                  onClick={async () => {
                    const { auth } = await import("../../../lib/firebase/client");
                    if (auth.currentUser) {
                      await auth.currentUser.reload();
                      await auth.currentUser.getIdToken(true);
                    }
                    window.location.href = "/own-dashboard";
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Continue to Set Up Company Account
                </button>
              </div>
            )}
          </div>

          {/* Verification Process Timeline (4 Steps) */}
          <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 md:p-8 shadow-sm space-y-6">
            <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
              <Icon icon="solar:route-bold-duotone" className="w-5 h-5 text-[#00A651]" />
              Verification Process Timeline
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {TIMELINE_STEPS.map((s) => {
                const isDone = s.step <= activeStep;
                const isCurrent = s.step === activeStep + 1 && status === "pending";
                return (
                  <div
                    key={s.step}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? "bg-[#EBF8F2] border-[#00A651]/40 text-emerald-950"
                        : isCurrent
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest">Step 0{s.step}</span>
                      <Icon
                        icon={isDone ? "solar:check-circle-bold-duotone" : isCurrent ? "solar:clock-circle-bold-duotone" : "solar:minus-circle-bold-duotone"}
                        className={`w-4 h-4 ${isDone ? "text-[#00A651]" : isCurrent ? "text-amber-500" : "text-gray-300"}`}
                      />
                    </div>
                    <p className="text-xs font-extrabold leading-snug">{s.name}</p>
                    <p className="text-[11px] font-medium mt-1 opacity-80 leading-normal">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
