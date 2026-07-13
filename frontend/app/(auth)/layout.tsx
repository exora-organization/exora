import * as React from "react";



export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EBF8F2] flex items-center justify-center selection:bg-[#00A651]/20 p-4 relative overflow-hidden">
      {/* Background Graphic elements if any (kept simple for clean look) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A651]/5 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00A651]/5 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3"></div>

      {/* Auth Content Container */}
      <div className="w-full max-w-lg relative z-10 transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
        {children}
      </div>
    </div>
  );
}
