import * as React from "react";

import Image from "next/image";
import dashboardBg from "../../public/export_map_hero.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F3] selection:bg-[#2F6B4F]/20 p-4 relative overflow-hidden">
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

      {/* Auth Content Container */}
      <div className="w-full max-w-lg relative z-10 transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
        {children}
      </div>
    </div>
  );
}
