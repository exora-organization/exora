"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiCompany } from "../../../lib/api/company";
import { CompanyApplicationForm } from "../../../components/forms/CompanyApplicationForm";
import { Button } from "../../../components/ui/button";
import logoImg from "../../../public/logo.png";

export default function ApplicationStatusPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["application-status"],
    queryFn: () => apiCompany.getApplicationStatus(),
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full">
      <div className="group bg-white/95 backdrop-blur-xl border border-white/60 p-6 sm:p-10 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-center space-x-3 mb-8 text-center relative z-10">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1a2b3c] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );

  const PrimaryButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <Button 
      onClick={onClick}
      className="w-full h-12 bg-gradient-to-r from-[#0a9b5c] to-[#08824d] hover:from-[#08824d] hover:to-[#06683e] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 mt-4"
    >
      {children}
    </Button>
  );

  const SecondaryButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <Button 
      variant="outline"
      onClick={onClick}
      className="w-full h-12 rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors mt-4"
    >
      {children}
    </Button>
  );

  if (isLoading) {
    return (
      <Wrapper>
        <div className="text-center pt-6 pb-6">
          <div className="flex justify-center items-center h-24 mb-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a9b5c]"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Checking Status</h2>
          <p className="text-sm text-gray-500">Please wait a moment...</p>
        </div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <div className="text-center pt-6 pb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-1 tracking-tight">Error</h2>
          <p className="text-sm text-gray-500 mb-6">Failed to load application status.</p>
          <SecondaryButton onClick={() => refetch()}>
            RETRY
          </SecondaryButton>
        </div>
      </Wrapper>
    );
  }

  const appData = data?.data;

  // If there's no application data, user might not have applied yet
  if (!appData) {
    return (
      <Wrapper>
        <div className="text-center pt-6 pb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">No Application</h2>
          <p className="text-sm text-gray-500 mb-6">You haven't submitted a company application yet.</p>
          <PrimaryButton onClick={() => router.push("/company-application")}>
            APPLY NOW
          </PrimaryButton>
        </div>
      </Wrapper>
    );
  }

  switch (appData.status) {
    case "pending":
      return (
        <Wrapper>
          <div className="text-center pt-2 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Application Pending</h2>
            <p className="text-sm text-gray-500 mb-8">Your application is currently under review by our admin team.</p>
            
            <div className="p-4 bg-[#eef3f7] text-gray-700 rounded-xl mb-6 text-sm">
              <p>We will notify you once your application has been processed.</p>
            </div>
            
            <PrimaryButton onClick={() => refetch()}>
              REFRESH STATUS
            </PrimaryButton>
          </div>
        </Wrapper>
      );

    case "approved":
      return (
        <Wrapper>
          <div className="text-center pt-2 pb-6">
            <h2 className="text-2xl font-bold text-[#0a9b5c] mb-1 tracking-tight">Application Approved!</h2>
            <p className="text-sm text-gray-500 mb-8">Congratulations, your company has been approved.</p>
            
            <p className="text-sm text-gray-600 mb-8 px-4">
              You now have full access to EXORA as a Company Owner. 
              Click below to proceed to your new dashboard.
            </p>
            
            <PrimaryButton onClick={async () => {
              const { auth } = await import("../../../lib/firebase/client");
              if (auth.currentUser) {
                await auth.currentUser.reload();
                const token = await auth.currentUser.getIdToken(true);
                document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;
              }
              window.location.href = "/owner-dashboard";
            }}>
              GO TO DASHBOARD
            </PrimaryButton>
          </div>
        </Wrapper>
      );

    case "rejected":
      return (
        <Wrapper>
          <div className="text-center pt-2 pb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-1 tracking-tight">Application Rejected</h2>
            <p className="text-sm text-gray-500 mb-6">Unfortunately, your application was not approved.</p>
            
            <p className="text-sm text-gray-600 px-4">
              Please contact support if you believe this was a mistake or if you need further clarification.
            </p>
          </div>
        </Wrapper>
      );

    case "revision_requested":
      return (
        <Wrapper>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-amber-600 mb-1 tracking-tight">Revision Requested</h2>
            <p className="text-sm text-gray-500">Please review the admin's feedback and resubmit your application.</p>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm mb-8 text-left">
            <p className="font-bold text-xs tracking-widest uppercase mb-1">Admin Notes:</p>
            <p>{appData.revisionNotes || "No notes provided."}</p>
          </div>
          
          <CompanyApplicationForm 
            isRevision={true}
            initialData={{
              companyName: appData.companyName,
              businessSector: appData.businessSector,
              country: appData.country,
            }}
            onSuccess={() => refetch()}
          />
        </Wrapper>
      );

    default:
      return null;
  }
}
