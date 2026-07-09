"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
  Building, 
  Users, 
  Activity, 
  FileText, 
  User,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Company Approvals", href: "/company-approvals", icon: Building },
    { name: "User Management", href: "/users", icon: Users },
    { name: "System Monitoring", href: "/system-monitoring", icon: Activity },
    { name: "Audit Logs", href: "/audit-logs", icon: FileText },
    { name: "Account", href: "/profile", icon: User },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF8F3] md:bg-gradient-to-br from-[#FAF8F3] to-[#F5F8F6]">
          
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between bg-white border-b border-[#E8E3D9] px-6 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
            </div>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </header>

          {/* Mobile Overlay Backdrop */}
          {isOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-20 transition-opacity duration-200"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed md:static inset-y-0 left-0 w-64 bg-white h-screen md:h-auto flex flex-col shadow-sm border-r border-[#E8E3D9] z-30
            transition-transform duration-200 ease-in-out md:translate-x-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="md:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF] -mt-4 mb-4 ml-16 hidden md:block">Centralized Monitoring</p>

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
                        ? "bg-[#F5F8F6] text-[#2F6B4F]" 
                        : "text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1F2937]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Profile Area */}
            <div className="p-4 mt-auto border-t border-[#E8E3D9]/50">
              {/* User Info */}
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-colors hover:bg-[#FAF8F3] cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-[#2F6B4F] text-white font-medium">
                    {profile?.displayName?.charAt(0) || "A"}
                  </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-[#1F2937] truncate">{profile?.displayName || "Sheryl Admin"}</span>
                  <span className="text-xs text-[#9CA3AF] truncate">System Lead</span>
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
          <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-full">
            {children}
          </main>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
