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
    router.push("/company-approvals");
  }, [companyId, queryClient, router]);

  if (!application) return <div className="p-8 text-center">Loading details...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/company-approvals" className="text-sm text-blue-500 hover:underline mb-2 block">
            &larr; Back to Approvals
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
        </div>
        <Badge variant={application.status === "pending" ? "default" : application.status === "approved" ? "secondary" : "destructive"} className="text-sm px-3 py-1">
          {application.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#9CA3AF]">Company Name</p>
              <p className="font-medium text-lg">{application.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">Business Sector</p>
              <p className="font-medium text-lg">{application.businessSector}</p>
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">Country</p>
              <p className="font-medium text-lg">{application.country}</p>
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">Submitted At</p>
              <p className="font-medium text-lg">{new Date(application.submittedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#9CA3AF]">User ID</p>
              <p className="font-medium">{application.applicant.userId}</p>
            </div>
            <div>
              <p className="text-sm text-[#9CA3AF]">Email</p>
              <p className="font-medium">{application.applicant.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {application.status === "pending" && (
        <div className="pt-4 flex justify-end">
          <ApprovalActions companyId={application.companyId} />
        </div>
      )}
    </div>
  );
}
