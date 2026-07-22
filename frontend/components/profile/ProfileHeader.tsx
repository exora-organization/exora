"use client";

import { UserRole } from "../../lib/types/user";
import { Badge } from "../ui/badge";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  role: UserRole;
}

const roleColors: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  company_owner: "bg-blue-100 text-blue-800 border-blue-200",
  export_manager: "bg-green-100 text-green-800 border-green-200",
  finance_staff: "bg-green-100 text-green-800 border-green-200",
  guest: "bg-gray-100 text-gray-800 border-gray-200",
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
