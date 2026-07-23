"use client";

import { Icon } from "@iconify/react";

interface StageNotReadyStateProps {
  currentStage: string;
  prerequisiteStage: string;
  responsibleRole: string;
  message?: string;
}

export function StageNotReadyState({
  currentStage,
  prerequisiteStage,
  responsibleRole,
  message,
}: StageNotReadyStateProps) {
  return (
    <div className="p-6 md:p-8 bg-amber-50/90 backdrop-blur-md border border-amber-200 rounded-3xl text-amber-900 shadow-sm my-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
          <Icon icon="solar:lock-keyhole-bold-duotone" className="w-6 h-6" />
        </div>
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
            Stage Blocked
          </span>
          <h4 className="text-base font-extrabold text-amber-950 mt-1">
            {currentStage} is pending prerequisite data
          </h4>
        </div>
      </div>

      <p className="text-xs md:text-sm font-medium leading-relaxed pl-13">
        {message || `Waiting for ${responsibleRole} to complete ${prerequisiteStage} before ${currentStage} can be calculated.`}
      </p>
    </div>
  );
}
