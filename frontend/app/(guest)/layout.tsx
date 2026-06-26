import * as React from "react";
import { LogoutButton } from "../../components/ui/logout-button";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { RoleGuard } from "../../components/auth/RoleGuard";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["guest"]}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">EXORA</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-6 flex items-start justify-center mt-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
