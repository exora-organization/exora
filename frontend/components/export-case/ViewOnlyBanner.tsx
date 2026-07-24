"use client";

import { Icon } from "@iconify/react";

interface ViewOnlyBannerProps {
  ownerRoleName: string;
  dataTopic: string;
}

export function ViewOnlyBanner({ ownerRoleName, dataTopic }: ViewOnlyBannerProps) {
  return (
    <div className="flex items-center gap-3.5 p-4 md:p-5 bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-3xl text-xs md:text-sm text-blue-900 font-semibold shadow-sm my-3">
      <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        <Icon icon="solar:eye-bold-duotone" className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
            View-Only Mode
          </span>
        </div>
        <p className="leading-relaxed font-medium">
          You are viewing {dataTopic} in read-only mode. Input and modification is managed by <strong className="text-blue-900 font-extrabold">{ownerRoleName}</strong>.
        </p>
      </div>
    </div>
  );
}
