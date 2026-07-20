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
  Lightbulb, 
  Menu,
  X,
  Briefcase,
  FileBarChart2
} from "lucide-react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/owner-dashboard", icon: LayoutDashboard },
    { name: "Company Profile", href: "/company-profile", icon: Building },
    { name: "Team Management", href: "/team-management", icon: Users },
    { name: "Export Cases", href: "/export-cases", icon: Briefcase },
    { name: "Analytics", href: "/owner-analytics", icon: Activity },
    { name: "AI Advisor", href: "/owner-ai-advisor", icon: Lightbulb },
    { name: "Export Feasibility Report", href: "/export-feasibility-report", icon: FileBarChart2 },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["company_owner"]}>
        <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#EBF8F2] md:bg-gradient-to-br from-[#EBF8F2] to-[#EBF8F2]">
          
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between bg-white border-b border-[#E8E3D9] px-6 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
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
            fixed md:static inset-y-0 left-0 w-64 bg-white h-screen md:h-auto flex flex-col shadow-sm border-r border-[#D1EDE4] z-30
            transition-transform duration-200 ease-in-out md:translate-x-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="md:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs font-bold text-[#9CA3AF] -mt-5 mb-4 ml-[72px] hidden md:block">Company Owner Portal</p>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-extrabold text-sm ${
                      isActive 
                        ? "bg-[#00A651] text-white shadow-lg shadow-[#00A651]/30 -translate-y-0.5" 
                        : "text-[#4B5563] hover:bg-white hover:shadow-md hover:text-[#00A651] hover:-translate-y-0.5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="tracking-wide uppercase text-[11px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Profile Area */}
            <div className="p-6 mt-auto border-t border-white/40 bg-white/30 backdrop-blur-sm">
              {/* User Info */}
              <Link href="/profile" className="flex items-center gap-4 px-4 py-3 mb-4 rounded-2xl transition-all hover:bg-white hover:shadow-md group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A651] to-[#008F44] overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <div className="w-full h-full flex items-center justify-center text-white font-extrabold text-lg">
                    {profile?.displayName?.charAt(0) || "O"}
                  </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-extrabold text-[#1F2937] truncate group-hover:text-[#00A651] transition-colors">{profile?.displayName || "Company Owner"}</span>
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest truncate mt-0.5">Administrator</span>
                </div>
              </Link>

              {/* Logout */}
              <div className="w-full">
                <LogoutButton />
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
