"use client";

import { UserRole } from "../../lib/types/user";

interface RoleBadgeProps {
  role: UserRole | string | null;
  companyName?: string | null;
  size?: "sm" | "md";
}

const roleConfigs: Record<string, { label: string; bg: string; text: string; border: string }> = {
  guest: { label: "GUEST", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  admin: { label: "SYSTEM ADMIN", bg: "bg-[#EBF8F2]", text: "text-[#00A651]", border: "border-[#00A651]/30" },
  company_owner: { label: "COMPANY OWNER", bg: "bg-[#EBF8F2]", text: "text-[#00A651]", border: "border-[#00A651]/30" },
  export_manager: { label: "EXPORT MANAGER", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  finance_staff: { label: "FINANCE STAFF", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
};

export function RoleBadge({ role, companyName, size = "md" }: RoleBadgeProps) {
  const config = roleConfigs[role || ""] || {
    label: (role || "USER").toUpperCase(),
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  const isSmall = size === "sm";

  return (
    <div className="inline-flex flex-col gap-0.5">
      <span
        className={`font-black uppercase tracking-widest rounded-md border inline-block w-fit ${config.bg} ${config.text} ${config.border} ${
          isSmall ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
        }`}
      >
        {config.label}
      </span>
      {companyName && (
        <span className="text-[10px] font-bold text-gray-500 truncate max-w-[150px]">
          {companyName}
        </span>
      )}
    </div>
  );
}
