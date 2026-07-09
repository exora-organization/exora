"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";
import { 
  LayoutDashboard, 
  Building, 
  Users, 
  Activity, 
  FileText, 
  Wallet, 
  Settings,
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Company Approvals", href: "/company-approvals", icon: Building },
    { name: "User Management", href: "/users", icon: Users },
    { name: "System Monitoring", href: "/system-monitoring", icon: Activity },
    { name: "Audit Logs", href: "/audit-logs", icon: FileText },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="min-h-screen flex flex-col md:flex-row bg-[#eef8f2] md:bg-gradient-to-br from-[#e6f5eb] to-[#e0f0f8]">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white md:min-h-screen flex flex-col shadow-sm border-r border-gray-100 z-10">
            {/* Logo Area */}
            <div className="p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-800">EXORA <span className="font-medium">Admin</span></h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-10">Centralized Monitoring</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                      isActive 
                        ? "bg-[#e6f5eb] text-[#0a8c4f]" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Profile Area */}
            <div className="p-4 mt-auto">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-[#0a8c4f] text-white font-medium">
                    {profile?.displayName?.charAt(0) || "A"}
                  </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 truncate">{profile?.displayName || "Sheryl Admin"}</span>
                  <span className="text-xs text-slate-500 truncate">System Lead</span>
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="space-y-1">
                <Link 
                  href="/admin-dashboard/settings" 
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </Link>
                <div className="px-4 py-2 flex items-center">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
