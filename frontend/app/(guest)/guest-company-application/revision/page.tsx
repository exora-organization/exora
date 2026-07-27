"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { apiCompany } from "../../../../lib/api/company";
import { CompanyApplicationForm } from "../../../../components/forms/CompanyApplicationForm";
import logoImg from "../../../../public/logo.png";
import heroBg from "../../../../public/dashboard-bg.png";

export default function RevisionPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["application-status"],
    queryFn: () => apiCompany.getApplicationStatus(),
  });

  const appData = data?.data;

  if (isLoading) {
    return (
      <div className="-m-6 md:-m-10 p-6 md:p-10 relative min-h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`,
          }}
        />
        <div className="relative z-10 p-10 bg-white/95 rounded-[2rem]">
          <div className="flex justify-center items-center h-24 mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a9b5c]"></div>
          </div>
          <div className="text-center font-bold text-[#1F2937]">Loading...</div>
        </div>
      </div>
    );
  }

  // Inside component, use useEffect for redirect
  useEffect(() => {
    if (appData && appData.status !== "revision_requested" && appData.status !== "rejected") {
      router.push("/guest-dashboard");
    }
  }, [appData, router]);

  if (appData?.status !== "revision_requested" && appData?.status !== "rejected") {
    return null;
  }

  return (
    <div className="-m-6 md:-m-10 p-6 md:p-10 relative min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`,
        }}
      />

      <div className="group bg-white/95 backdrop-blur-xl border border-white/60 p-6 sm:p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10 w-full max-w-xl my-8">
        <div className="flex items-center justify-center space-x-3 mb-8 text-center relative z-10">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} loading="eager" alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1a2b3c] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-1 tracking-tight ${appData.status === "rejected" ? "text-red-600" : "text-amber-600"}`}>
              {appData.status === "rejected" ? "Application Rejected" : "Revision Requested"}
            </h2>
            <p className="text-sm text-[#9CA3AF]">
              {appData.status === "rejected" 
                ? "Your application was not approved. Please review the reason below and resubmit." 
                : "Please review the admin's feedback and resubmit your application."}
            </p>
          </div>

          <div className={`p-4 border rounded-xl text-sm mb-8 text-left ${appData.status === "rejected" ? "bg-red-50 border-red-100 text-red-800" : "bg-amber-50 border-amber-100 text-amber-800"}`}>
            <p className="font-bold text-xs tracking-widest uppercase mb-1">
              {appData.status === "rejected" ? "Rejection Reason:" : "Admin Notes:"}
            </p>
            <p>{(appData.status === "rejected" ? appData.rejectReason : appData.revisionNotes) || "No notes provided."}</p>
          </div>

          <CompanyApplicationForm
            isRevision={true}
            initialData={{
              companyName: appData.companyName,
              businessSector: appData.businessSector,
              country: appData.country,
            }}
            onSuccess={() => router.push("/guest-application-status")}
          />
        </div>
      </div>
    </div>
  );
}
