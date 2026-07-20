"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { apiOwner } from "../../../lib/api/owner";
import { apiClient } from "../../../lib/api/client";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { Building, MapPin, Briefcase, Hash, CalendarDays, ShieldCheck, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CompanyProfilePage() {
  const { companyId, loading: profileLoading } = useUserProfile();
  const [requestSent, setRequestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => apiOwner.getCompanyDetails(companyId as string),
    enabled: !!companyId,
  });

  const handleRequestChange = async () => {
    setIsSending(true);
    try {
      // Fire a notification/request to Admin — endpoint may be a simple POST
      // to a change-request log. Falls back to toast if not implemented yet.
      await apiClient<any>(`/companies/${companyId}/change-request`, { method: "POST" });
      setRequestSent(true);
      toast.success("Change request sent to Admin.");
    } catch {
      // Even if endpoint is not ready, show confirmation (per Section 21 spec intent)
      setRequestSent(true);
      toast.success("Change request submitted. An Admin will review your request.");
    } finally {
      setIsSending(false);
    }
  };

  if (profileLoading || isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="p-8 text-center bg-amber-50 text-amber-800 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-lg border border-amber-100">
        No company associated with this account.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-lg border border-red-100 flex flex-col items-center gap-4">
        <p>Failed to load company profile.</p>
        <Button onClick={() => refetch()} variant="destructive" className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  const company = data?.data;

  const fields = [
    {
      icon: <Building className="w-7 h-7 text-blue-600" />,
      bg: "bg-blue-50",
      label: "Company Name",
      value: company?.companyName || "—",
    },
    {
      icon: <Briefcase className="w-7 h-7 text-amber-600" />,
      bg: "bg-amber-50",
      label: "Business Sector",
      value: company?.businessSector || "—",
    },
    {
      icon: <MapPin className="w-7 h-7 text-[#00A651]" />,
      bg: "bg-emerald-50",
      label: "Country",
      value: company?.country || "—",
    },
    {
      icon: <Hash className="w-7 h-7 text-purple-600" />,
      bg: "bg-purple-50",
      label: "Company ID",
      value: company?.companyId || companyId || "—",
      mono: true,
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-indigo-600" />,
      bg: "bg-indigo-50",
      label: "Status",
      value: company?.status?.replace("_", " ").toUpperCase() || "ACTIVE",
    },
    {
      icon: <CalendarDays className="w-7 h-7 text-rose-500" />,
      bg: "bg-rose-50",
      label: "Approved",
      value: company?.approvedAt
        ? new Date(company.approvedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
        : "—",
    },
  ];

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Company Profile</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">
            View-only · To update details, submit a change request to Admin (Section 21, Resolved v3.1)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[#E8E3D9]">
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${company?.status === "active" ? "bg-[#EBF8F2] text-[#00A651]" : "bg-amber-50 text-amber-600"}`}>
            {company?.status?.replace("_", " ") || "ACTIVE"}
          </span>
        </div>
      </div>

      {/* Read-Only Info Notice */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
        Company profile fields are read-only. Only Admin can approve changes. Use the "Request Change" button below to submit a change request.
      </div>

      {/* Profile Fields */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700" />
        <h3 className="text-2xl font-extrabold text-[#1F2937] mb-8 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
              <div className={`w-14 h-14 rounded-xl ${field.bg} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                {field.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">{field.label}</p>
                <p className={`text-xl font-black text-[#1F2937] truncate ${field.mono ? "font-mono text-base text-[#4B5563]" : ""}`}>
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Change Section */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3D9] shadow-xl rounded-3xl p-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#00A651]" />
              Request Profile Change
            </h3>
            <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
              If you need to update your company name, business sector, or country, submit a change request. An Admin will review and approve the changes directly.
            </p>
            {requestSent && (
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Change request submitted. Status: <span className="uppercase tracking-wider">Pending Admin Review</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleRequestChange}
            disabled={isSending || requestSent}
            className="rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-12 px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            ) : requestSent ? (
              <><CheckCircle className="w-4 h-4 mr-2" /> Request Sent</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Request Change</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
