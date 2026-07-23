"use client";

import { Icon } from "@iconify/react";

export interface StepperStep {
  id: string;
  name: string;
  roleLabel: string;
  userInitials: string;
  userName: string;
  status: "completed" | "in_progress" | "waiting";
  icon: string;
}

interface CaseProgressStepperProps {
  hasCostData: boolean;
  hasPricingData: boolean;
  hasFinancialData: boolean;
  hasRiskData: boolean;
  hasAdvisorData: boolean;
  assignedStaffInitials?: {
    financeStaff?: string;
    exportManager?: string;
    companyOwner?: string;
  };
}

export function CaseProgressStepper({
  hasCostData,
  hasPricingData,
  hasFinancialData,
  hasRiskData,
  hasAdvisorData,
  assignedStaffInitials = {
    financeStaff: "SD",
    exportManager: "EM",
    companyOwner: "PO",
  },
}: CaseProgressStepperProps) {
  const steps: StepperStep[] = [
    {
      id: "costing",
      name: "Costing",
      roleLabel: "Finance Staff",
      userInitials: assignedStaffInitials.financeStaff || "FS",
      userName: "Finance Staff",
      status: hasCostData ? "completed" : "in_progress",
      icon: "solar:calculator-bold-duotone",
    },
    {
      id: "pricing",
      name: "Pricing & Incoterms",
      roleLabel: "Export Manager",
      userInitials: assignedStaffInitials.exportManager || "EM",
      userName: "Export Manager",
      status: hasPricingData ? "completed" : hasCostData ? "in_progress" : "waiting",
      icon: "solar:tag-price-bold-duotone",
    },
    {
      id: "financial",
      name: "Financial Analysis",
      roleLabel: "Finance Staff",
      userInitials: assignedStaffInitials.financeStaff || "FS",
      userName: "Finance Staff",
      status: hasFinancialData ? "completed" : hasPricingData ? "in_progress" : "waiting",
      icon: "solar:chart-square-bold-duotone",
    },
    {
      id: "risk",
      name: "Risk Assessment",
      roleLabel: "Export Manager",
      userInitials: assignedStaffInitials.exportManager || "EM",
      userName: "Export Manager",
      status: hasRiskData ? "completed" : hasFinancialData ? "in_progress" : "waiting",
      icon: "solar:shield-check-bold-duotone",
    },
    {
      id: "advisor",
      name: "AI Advisor",
      roleLabel: "All Roles",
      userInitials: "AI",
      userName: "AI Advisor Engine",
      status: hasAdvisorData ? "completed" : hasRiskData ? "in_progress" : "waiting",
      icon: "solar:lightbulb-bold-duotone",
    },
    {
      id: "reports",
      name: "Export Reports",
      roleLabel: "Company Owner",
      userInitials: assignedStaffInitials.companyOwner || "PO",
      userName: "Company Owner",
      status: hasAdvisorData ? "completed" : "waiting",
      icon: "solar:document-text-bold-duotone",
    },
  ];

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-xl rounded-3xl p-6 md:p-8 relative overflow-hidden my-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-extrabold text-[#1F2937] dark:text-white flex items-center gap-2">
            <Icon icon="solar:route-bold-duotone" className="w-5 h-5 text-[#00A651]" />
            Workflow Stepper & Person in Charge (PIC)
          </h4>
          <p className="text-xs font-semibold text-[#6B7280] dark:text-gray-400 mt-0.5">
            Export transaction progress steps and assigned personnel initials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed";
          const isInProgress = step.status === "in_progress";

          return (
            <div
              key={step.id}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                isDone
                  ? "bg-[#EBF8F2] dark:bg-emerald-950/40 border-[#00A651]/30 text-[#00A651]"
                  : isInProgress
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200 shadow-sm ring-2 ring-amber-200 dark:ring-amber-900"
                  : "bg-gray-50/70 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-gray-500 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Step 0{idx + 1}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isDone
                        ? "bg-[#00A651] text-white"
                        : isInProgress
                        ? "bg-amber-500 text-white"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <Icon icon={step.icon} className="w-4 h-4" />
                  </div>
                </div>

                <h5 className="text-xs font-black text-[#1F2937] dark:text-white leading-snug mb-1">
                  {step.name}
                </h5>
              </div>

              <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5" title={`PIC: ${step.userName} (${step.roleLabel})`}>
                  <div className="w-5 h-5 rounded-full bg-[#00A651] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                    {step.userInitials}
                  </div>
                  <span className="text-[9px] font-bold text-[#4B5563] dark:text-gray-400 truncate max-w-[65px]">
                    {step.roleLabel}
                  </span>
                </div>
                {isDone ? (
                  <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-[#00A651]" />
                ) : isInProgress ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                ) : (
                  <Icon icon="solar:lock-bold-duotone" className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
