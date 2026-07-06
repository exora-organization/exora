"use client";

import * as React from "react";
import Link from "next/link";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";

export default function ExportManagerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["company_owner", "export_manager", "finance_staff", "admin"]}>
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-white">EXORA</h1>
          <p className="text-xs text-slate-400 mt-1">Export Manager</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/export-manager-dashboard" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/export-case" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Export Cases
          </Link>
          <Link href="/em-analytics" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Analytics
          </Link>
          <Link href="/em-advisor" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            AI Advisor
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 flex flex-col space-y-4">
          <div className="text-sm text-slate-300">
            <p className="font-semibold truncate">{profile?.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
