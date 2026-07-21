"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LogoutButton } from "../../components/ui/logout-button";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";
import logoImg from "../../public/logo.png";
import { Icon } from "@iconify/react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/guest-dashboard", icon: "solar:widget-bold-duotone" },
  { name: "Company Application", href: "/company-application", icon: "solar:document-text-bold-duotone" },
  { name: "Application Status", href: "/application-status", icon: "solar:document-text-bold-duotone" },
];

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const { role } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Redirect if role has been upgraded
  useEffect(() => {
    if (role === "company_owner") router.push("/owner-dashboard");
    else if (role === "export_manager") router.push("/export-manager-dashboard");
    else if (role === "finance_staff") router.push("/finance-dashboard");
    else if (role === "admin") router.push("/admin-dashboard");
  }, [role, router]);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["guest", "company_owner"]}>
        <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-[#EBF8F2]">

          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between bg-white border-b border-[#E8E3D9] px-6 py-4 sticky top-0 z-20 w-full">
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <Image src={logoImg} alt="EXORA Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer"
            >
              {isOpen ? <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" /> : <Icon icon="solar:hamburger-menu-linear" className="w-6 h-6" />}
            </button>
          </header>

          {/* Mobile Overlay */}
          {isOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-20"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed md:static inset-y-0 left-0 w-64 bg-white h-screen flex flex-col shadow-sm border-r border-[#D1EDE4] z-30
            transition-transform duration-200 ease-in-out md:translate-x-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <Image src={logoImg} alt="EXORA Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">EXORA</h1>
              </div>
              <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] font-bold text-[#9CA3AF] -mt-4 mb-5 ml-[72px] hidden md:block uppercase tracking-widest">
              Guest Portal
            </p>

            {/* Nav */}
            <nav className="flex-1 px-4 py-2 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
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
                    <Icon icon={item.icon} className="w-5 h-5" />
                    <span className="tracking-wide uppercase text-[11px]">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-6 mt-auto border-t border-[#E8E3D9]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Account</p>
              <LogoutButton className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl h-10 font-bold text-xs uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-md transition-all group" />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-full">
            {children}
          </main>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
