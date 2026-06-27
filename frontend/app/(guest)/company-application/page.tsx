"use client";

import { useRouter } from "next/navigation";
import { CompanyApplicationForm } from "../../../components/forms/CompanyApplicationForm";

export default function CompanyApplicationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/application-status");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome to EXORA</h2>
        <p className="text-gray-500 mt-2">
          Please provide your company details to apply for access. Our admin team will review your application shortly.
        </p>
      </div>
      
      <CompanyApplicationForm onSuccess={handleSuccess} />
    </div>
  );
}
