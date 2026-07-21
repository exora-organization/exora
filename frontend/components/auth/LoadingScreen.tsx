import { Loader2 } from "lucide-react";
import Image from "next/image";
import logoImg from "../../public/logo.png";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#EBF8F2] selection:bg-[#00A651]/20 relative overflow-hidden">
      {/* Subtle Background Graphics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A651]/10 rounded-full blur-3xl -z-0 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00A651]/10 rounded-full blur-3xl -z-0 -translate-x-1/3 translate-y-1/3"></div>

      <div className="text-center space-y-6 z-10 bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl border border-white flex flex-col items-center">
        <div className="relative w-20 h-20 animate-pulse">
          <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        
        <div className="flex items-center space-x-3 text-[#1F2937]">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
          <p className="text-xl font-extrabold tracking-tight">Loading EXORA...</p>
        </div>
      </div>
    </div>
  );
}
