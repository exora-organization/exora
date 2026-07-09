import * as React from "react";
import { LogoutButton } from "../../components/ui/logout-button";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";

import Image from "next/image";
import dashboardBg from "../../public/export_map_hero.png";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["guest"]}>
        <div className="min-h-screen bg-[#FAF8F3] relative overflow-hidden flex flex-col">
          {/* Background Graphic */}
          <div className="absolute inset-0 z-0">
            <Image
              src={dashboardBg}
              alt="Dashboard Background"
              fill
              priority
              className="object-cover object-center scale-105"
            />
          </div>
          {/* Premium Glassmorphism Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FAF8F3]/90 via-white/80 to-[#F5F8F6]/90 backdrop-blur-[4px]"></div>

          <header className="relative z-10 bg-white/70 backdrop-blur-md border-b border-white/50 px-6 py-4 flex justify-between items-center shadow-sm">
            <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">EXORA</h1>
            <LogoutButton />
          </header>

          <main className="relative z-10 flex-1 p-6 flex items-start justify-center mt-8">
            <div className="w-full max-w-2xl">
              {children}
            </div>
          </main>
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
