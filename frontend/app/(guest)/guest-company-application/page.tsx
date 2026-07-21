"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImg from "../../../public/logo.png";
import { CompanyApplicationForm } from "../../../components/forms/CompanyApplicationForm";

export default function CompanyApplicationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/guest-application-status");
  };

  return (
    <div className="w-full">
      <div className="group bg-white/95 backdrop-blur-xl border border-white/60 p-6 sm:p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        
        <div className="flex items-center justify-center space-x-3 mb-6 text-center relative z-10">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1a2b3c] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>

        <div className="mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-1 tracking-tight">Register Company</h2>
          <p className="text-sm text-[#9CA3AF]">Provide your details to get started with EXORA.</p>
        </div>
        
        <div className="relative z-10">
          <CompanyApplicationForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
