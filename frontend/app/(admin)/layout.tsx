"use client";

import * as React from "react";
import Link from "next/link";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-white">EXORA Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin-dashboard" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/company-approvals" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Company Approvals
          </Link>
          <Link href="/users" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            User Management
          </Link>
          <Link href="/system-monitoring" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            System Monitoring
          </Link>
          <Link href="/audit-logs" className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium">
            Audit Logs
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-400">{profile?.displayName}</span>
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
