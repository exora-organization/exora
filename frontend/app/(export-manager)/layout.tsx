"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";
import logoImg from "../../public/logo.png";
import { 
  LayoutDashboard, 
  Briefcase, 
  Activity, 
  Lightbulb,
  User,
} from "lucide-react";

export default function ExportManagerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/export-manager-dashboard", icon: LayoutDashboard },
    { name: "Export Cases", href: "/export-case", icon: Briefcase },
    { name: "Analytics", href: "/em-analytics", icon: Activity },
    { name: "AI Recommendations", href: "/em-advisor", icon: Lightbulb },
    { name: "Account", href: "/profile", icon: User },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["company_owner", "export_manager", "finance_staff", "admin"]}>
        <div className="min-h-screen flex flex-col md:flex-row bg-[#EBF8F2] md:bg-gradient-to-br from-[#EBF8F2] to-[#EBF8F2]">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white md:min-h-screen flex flex-col shadow-sm border-r border-[#D1EDE4] z-10">
            {/* Logo Area */}
            <div className="p-6">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1 ml-10">Export Manager</p>
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
                        ? "bg-[#EBF8F2] text-[#00A651]" 
                        : "text-[#4B5563] hover:bg-[#EBF8F2] hover:text-[#1F2937]"
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
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-colors hover:bg-[#EBF8F2] cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-[#00A651] text-white font-medium">
                    {profile?.displayName?.charAt(0) || "E"}
                  </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-[#1F2937] truncate">{profile?.displayName || "Export Manager"}</span>
                  <span className="text-xs text-[#9CA3AF] truncate">{profile?.email || "export@company.com"}</span>
                </div>
              </Link>

              {/* Logout */}
              <div className="space-y-1">
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
