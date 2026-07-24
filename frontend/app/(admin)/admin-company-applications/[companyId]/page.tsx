"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiAdmin } from "../../../../lib/api/admin";
import { AdminCompanyApplication } from "../../../../lib/types/admin";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { ApprovalActions } from "../../../../components/admin/ApprovalActions";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = params.companyId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    staleTime: 30000,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    businessSector: "",
    country: "",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const application = data?.data?.items?.find((item) => item.companyId === companyId);

  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName || "",
        businessSector: application.businessSector || "",
        country: application.country || "",
      });
    }
  }, [application]);

  if (isLoading) {
    return <div className="p-8 text-center font-bold text-[#1F2937]">Loading application details...</div>;
  }

  if (!application) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-bold">Application not found or removed.</p>
        <Link href="/admin-company-applications">
          <Button variant="outline" className="font-bold border-[#E8E3D9]">Back to Applications List</Button>
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    queryClient.setQueryData(["admin-applications"], (oldData: any) => {
      if (!oldData?.data?.items) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          items: oldData.data.items.map((item: AdminCompanyApplication) => {
            if (item.companyId === companyId) {
              return {
                ...item,
                companyName: formData.companyName,
                businessSector: formData.businessSector,
                country: formData.country,
              };
            }
            return item;
          }),
        },
      };
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 text-[#1F2937]">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin-company-applications"
          className="p-2.5 bg-white hover:bg-[#EBF8F2] text-[#4B5563] hover:text-[#00A651] rounded-2xl border border-[#E8E3D9] shadow-xs transition-colors flex items-center justify-center"
        >
          <Icon icon="solar:alt-arrow-left-bold-duotone" className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Application Details</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">Review and manage company registration</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge
            className={`text-xs px-4 py-1.5 rounded-full uppercase tracking-widest font-extrabold shadow-xs ${
              application.status === "pending"
                ? "bg-blue-100 text-blue-700"
                : application.status === "revision_requested"
                ? "bg-indigo-100 text-indigo-700"
                : application.status === "approved"
                ? "bg-[#EBF8F2] text-[#00A651]"
                : "bg-red-100 text-red-700"
            }`}
          >
            {application.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Save Success Notification */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-emerald-600" />
          Company application details successfully updated.
        </div>
      )}

      {/* Revision Requested Notice */}
      {application.status === "revision_requested" && (
        <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-3xl text-indigo-900 text-xs font-semibold flex items-start gap-3">
          <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-indigo-950 block uppercase tracking-wider text-[10px]">Revision Requested</span>
            This application is awaiting revision updates from the applicant or further administrative decision. You can manage, edit, approve, or reject this application below.
          </div>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
            Company Information
          </h3>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="rounded-xl border-[#E8E3D9] text-[#00A651] font-bold text-xs hover:bg-[#EBF8F2] flex items-center gap-1.5 cursor-pointer"
            >
              <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
              Edit Details
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                className="rounded-xl border-[#E8E3D9] font-bold text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className="rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold text-xs cursor-pointer"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {!isEditing ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="rounded-xl border-[#E8E3D9] font-semibold text-sm bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Business Sector</label>
              <Input
                value={formData.businessSector}
                onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                className="rounded-xl border-[#E8E3D9] font-semibold text-sm bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="rounded-xl border-[#E8E3D9] font-semibold text-sm bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Applicant Information */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <h3 className="text-xl font-extrabold text-[#1F2937] mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
          Applicant Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">User ID</p>
            <p className="font-mono text-sm font-medium bg-[#FAF8F3] p-2.5 rounded-xl border border-[#E8E3D9] text-[#4B5563] break-all">
              {application.applicant.userId}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Corporate Email</p>
            <p className="font-semibold text-lg text-[#1F2937]">{application.applicant.email}</p>
          </div>
        </div>
      </div>

      {/* Approval Actions Section (Enabled for any non-approved state) */}
      {application.status !== "approved" && (
        <div className="pt-6 flex justify-end">
          <ApprovalActions companyId={application.companyId} />
        </div>
      )}
    </div>
  );
}
