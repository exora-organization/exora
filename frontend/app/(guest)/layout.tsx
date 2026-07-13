import * as React from "react";
import { LogoutButton } from "../../components/ui/logout-button";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";



export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["guest"]}>
        <div className="min-h-screen bg-[#EBF8F2] relative overflow-hidden flex flex-col">
          {/* Background Graphic elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A651]/5 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00A651]/5 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3"></div>

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
