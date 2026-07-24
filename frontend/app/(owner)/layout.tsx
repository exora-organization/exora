"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";
import { HeaderNotificationCenter } from "../../components/navigation/HeaderNotificationCenter";
import { RoleBadge } from "../../components/ui/RoleBadge";
import logoImg from "../../public/logo.png";
import { Icon } from "@iconify/react";

const NAV_ITEMS = [
  { name: "Executive Dashboard", href: "/own-dashboard", icon: "solar:widget-bold-duotone" },
  { name: "Export Cases", href: "/own-export-cases", icon: "solar:case-minimalistic-bold-duotone" },
  { name: "Team Management", href: "/own-team-management", icon: "solar:users-group-rounded-bold-duotone" },
  { name: "Executive Reports", href: "/own-feasibility-report", icon: "solar:document-text-bold-duotone" },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { role, profile } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (role && role !== "company_owner") {
      if (role === "admin") router.push("/admin-dashboard");
      else if (role === "export_manager") router.push("/em-dashboard");
      else if (role === "finance_staff") router.push("/fs-dashboard");
      else if (role === "guest") router.push("/guest-dashboard");
    }
  }, [role, router]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isRedirecting = role && role !== "company_owner";

  return (
    <ProtectedRoute>
      {isRedirecting ? (
        <div className="h-screen w-screen flex items-center justify-center bg-[#FAF8F3]" />
      ) : (
        <RoleGuard allowedRoles={["company_owner"]}>
          <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#EBF8F2] transition-colors">

          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between bg-white border-b border-[#E8E3D9] px-6 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
            </div>
            <div className="flex items-center gap-3">
              <HeaderNotificationCenter />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer"
              >
                {isOpen ? <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" /> : <Icon icon="solar:box-bold-duotone" className="w-6 h-6" />}
              </button>
            </div>
          </header>

          {/* Mobile Overlay */}
          {isOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-20 transition-opacity"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed md:static inset-y-0 left-0 w-64 bg-white h-screen md:h-auto flex flex-col shadow-sm border-r border-[#D1EDE4] z-30
            transition-transform duration-200 ease-in-out md:translate-x-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Logo Area & Role Badge */}
            <div className="p-6 pb-4 border-b border-[#E8E3D9]">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937] leading-none">EXORA</h1>
                  <div className="mt-1.5">
                    <RoleBadge role="company_owner" size="sm" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-[#4B5563] truncate">
                {profile?.displayName || "Company Owner"}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all font-extrabold text-xs ${
                      isActive
                        ? "bg-[#00A651] text-white shadow-lg shadow-[#00A651]/30 -translate-y-0.5"
                        : "text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#00A651]"
                    }`}
                  >
                    <Icon icon={item.icon} className="w-5 h-5" />
                    <span className="tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Profile Links & Logout */}
            <div className="p-4 mt-auto border-t border-[#E8E3D9] space-y-2">
              <Link
                href="/profile"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-extrabold text-xs ${
                  pathname === "/profile"
                    ? "bg-[#00A651] text-white shadow-md shadow-[#00A651]/20"
                    : "text-[#4B5563] bg-[#FAF8F3] hover:bg-[#EBF8F2] hover:text-[#00A651]"
                }`}
              >
                <Icon icon="solar:user-circle-bold-duotone" className="w-5 h-5" />
                <span className="tracking-wide">My Profile</span>
              </Link>
              <Link
                href="/own-company-profile"
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-extrabold text-xs ${
                  pathname === "/own-company-profile"
                    ? "bg-[#00A651] text-white shadow-md shadow-[#00A651]/20"
                    : "text-[#4B5563] bg-[#FAF8F3] hover:bg-[#EBF8F2] hover:text-[#00A651]"
                }`}
              >
                <Icon icon="solar:buildings-bold-duotone" className="w-5 h-5" />
                <span className="tracking-wide">Company Profile</span>
              </Link>
              <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl h-11 font-extrabold text-xs uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm transition-all mt-1" />
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="flex-1 overflow-y-auto w-full max-w-full">
            <header className="hidden md:flex items-center justify-between bg-white/70 backdrop-blur-md border-b border-[#E8E3D9] px-8 py-4 sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Tenant Scope:</span>
                <span className="text-xs font-black text-[#00A651] bg-[#EBF8F2] px-2.5 py-1 rounded-lg border border-[#00A651]/20">EXECUTIVE OVERVIEW</span>
              </div>
              <HeaderNotificationCenter />
            </header>
            <div className="p-6 md:p-10 text-[#1F2937]">
              {children}
            </div>
          </main>
        </div>
      </RoleGuard>
      )}
    </ProtectedRoute>
  );
}
