"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminCompanyApplication } from "../../../../lib/types/admin";
import { ApiResponse, PaginatedResponse } from "../../../../lib/types/api";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { ApprovalActions } from "../../../../components/admin/ApprovalActions";
import Link from "next/link";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = params.companyId as string;
  
  const [application, setApplication] = useState<AdminCompanyApplication | null>(null);

  useEffect(() => {
    // Attempt to retrieve data from cache
    const cachedData = queryClient.getQueryData<ApiResponse<PaginatedResponse<AdminCompanyApplication>>>(["admin-applications"]);
    
    if (cachedData?.data?.items) {
      const found = cachedData.data.items.find(item => item.companyId === companyId);
      if (found) {
        setApplication(found);
        return;
      }
    }
    
    // If not found in cache, redirect back to list
    router.push("/admin-company-approvals");
  }, [companyId, queryClient, router]);

  if (!application) return <div className="p-8 text-center">Loading details...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin-company-approvals" className="p-2 bg-white hover:bg-[#EBF8F2] text-[#4B5563] hover:text-[#00A651] rounded-xl border border-[#E8E3D9] shadow-sm transition-colors flex items-center justify-center">
          <span className="text-xl">&larr;</span>
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Application Details</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">Review and manage company registration</p>
        </div>
        <div className="ml-auto">
          <Badge variant={application.status === "pending" ? "default" : application.status === "approved" ? "secondary" : "destructive"} 
            className={`text-xs px-4 py-1.5 rounded-full uppercase tracking-widest font-bold shadow-sm ${
              application.status === "pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
              application.status === "approved" ? "bg-[#EBF8F2] text-[#00A651] hover:bg-[#D1EDE4]" :
              "bg-red-100 text-red-700 hover:bg-red-200"
            }`}>
            {application.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
        <h3 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Company Name</p>
            <p className="font-semibold text-lg text-[#1F2937]">{application.companyName}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Business Sector</p>
            <p className="font-semibold text-lg text-[#1F2937]">{application.businessSector}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Country</p>
            <p className="font-semibold text-lg text-[#1F2937]">{application.country}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Submitted At</p>
            <p className="font-semibold text-lg text-[#1F2937]">{new Date(application.submittedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <h3 className="text-xl font-bold text-[#1F2937] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
          Applicant Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">User ID</p>
            <p className="font-mono text-sm font-medium bg-[#F3F4F6] p-2 rounded-lg text-[#4B5563] break-all">{application.applicant.userId}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Corporate Email</p>
            <p className="font-semibold text-lg text-[#1F2937]">{application.applicant.email}</p>
          </div>
        </div>
      </div>

      {application.status === "pending" && (
        <div className="pt-6 flex justify-end">
          <ApprovalActions companyId={application.companyId} />
        </div>
      )}
    </div>
  );
}
