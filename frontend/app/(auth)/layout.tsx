import * as React from "react";
import heroBg from "../../public/dashboard-bg.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center selection:bg-[#00A651]/20 p-4 relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`
      }}
    >
      {/* Auth Content Container */}
      <div className="w-full max-w-lg relative z-10 transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
        {children}
      </div>
    </div>
  );
}
