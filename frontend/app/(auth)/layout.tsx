import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#eafaf6] via-[#e3f4f9] to-[#dcf0f9] p-4">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
