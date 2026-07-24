"use client";

import { UserRole } from "../../lib/types/user";
import { Badge } from "../ui/badge";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  role: UserRole;
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-[#EBF8F2] text-[#00A651] border-[#00A651]/30",
  company_owner: "bg-[#EBF8F2] text-[#00A651] border-[#00A651]/30",
  export_manager: "bg-blue-100 text-blue-800 border-blue-200",
  finance_staff: "bg-emerald-100 text-emerald-800 border-emerald-200",
  guest: "bg-slate-100 text-slate-700 border-slate-200",
};

export function ProfileHeader({ displayName, email, role }: ProfileHeaderProps) {
  const safeName = displayName || "User";
  const safeRole = role || "guest";
  const formatRole = (r: string) => (r || "").split("_").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : "").join(" ");

  return (
    <div className="bg-slate-50 p-6 flex flex-col items-center text-center space-y-4 rounded-t-xl">
      <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm">
        {safeName.charAt(0).toUpperCase()}
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-900">{safeName}</h2>
        <p className="text-slate-500">{email || ""}</p>
      </div>
      <Badge variant="outline" className={`px-3 py-1 text-xs uppercase tracking-wider ${roleColors[safeRole] || ""}`}>
        {formatRole(safeRole)}
      </Badge>
    </div>
  );
}
