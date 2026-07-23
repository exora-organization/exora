"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "solar:box-bold-duotone",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-[#E8E3D9] dark:border-slate-800 shadow-sm rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto my-6 flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EBF8F2] dark:bg-emerald-950/40 border border-[#00A651]/20 flex items-center justify-center mb-5 shadow-inner">
        <Icon icon={icon} className="w-8 h-8 text-[#00A651]" />
      </div>

      <h4 className="text-2xl font-extrabold text-[#1F2937] dark:text-white mb-2">{title}</h4>
      <p className="text-sm font-medium text-[#6B7280] dark:text-gray-400 leading-relaxed max-w-md mb-6">
        {description}
      </p>

      {actionLabel && (
        actionHref ? (
          <Link href={actionHref}>
            <Button className="rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white font-bold h-11 px-6 shadow-md hover:shadow-lg transition-all">
              {actionLabel}
            </Button>
          </Link>
        ) : onAction ? (
          <Button
            onClick={onAction}
            className="rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white font-bold h-11 px-6 shadow-md hover:shadow-lg transition-all"
          >
            {actionLabel}
          </Button>
        ) : null
      )}
    </div>
  );
}
