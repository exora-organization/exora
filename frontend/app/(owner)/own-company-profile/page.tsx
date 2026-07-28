"use client";

import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { apiOwner } from "../../../lib/api/owner";
import { apiCompany } from "../../../lib/api/company";
import { Button } from "../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProfileChangePayload } from "../../../lib/types/company";
import { notificationStore } from "../../../lib/services/notificationStore";
import { HeaderNotificationCenter } from "../../../components/navigation/HeaderNotificationCenter";

export default function CompanyProfilePage() {
  const { companyId, loading: profileLoading } = useUserProfile();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileChangePayload>({
    companyName: "",
    businessSector: "",
    country: "",
    reason: "",
  });


  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => apiOwner.getCompanyDetails(companyId as string),
    enabled: !!companyId,
  });

  const { data: pendingReqData, refetch: refetchPendingReq } = useQuery({
    queryKey: ["pending-change-request", companyId],
    queryFn: () => apiCompany.getPendingChangeRequest(companyId as string),
    enabled: !!companyId,
    retry: false,
  });

  const company = data?.data;
  const pendingChange = pendingReqData?.data;

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || "",
        businessSector: company.businessSector || "",
        country: company.country || "",
        reason: "",
      });
    }
  }, [company]);


  const requestMutation = useMutation({
    mutationFn: (payload: ProfileChangePayload) =>
      apiCompany.requestChange(companyId as string, payload),
    onSuccess: () => {
      toast.success("Profile change request submitted to Admin.");
      notificationStore.addNotification({
        caseId: companyId as string,
        caseName: formData.companyName,
        message: `Company profile change request for '${formData.companyName}' submitted to Admin.`,
        targetRole: "admin",
        targetTab: "change_requests",
      });
      setIsModalOpen(false);
      refetchPendingReq();
      queryClient.invalidateQueries({ queryKey: ["pending-change-request", companyId] });
      queryClient.invalidateQueries({ queryKey: ["admin-change-requests-notification"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit change request.");
    },
  });


  const hasChanged =
    formData.companyName.trim() !== (company?.companyName || "").trim() ||
    formData.businessSector.trim() !== (company?.businessSector || "").trim() ||
    formData.country.trim() !== (company?.country || "").trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.businessSector.trim() || !formData.country.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!hasChanged) {
      toast.error("No changes detected. Please modify at least one field before submitting.");
      return;
    }
    requestMutation.mutate(formData);
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

  const fields = [
    {
      icon: <Icon icon="solar:buildings-bold-duotone" className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
      label: "Company Name",
      value: company?.companyName || "—",
    },
    {
      icon: <Icon icon="solar:case-bold-duotone" className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
      label: "Business Sector",
      value: company?.businessSector || "—",
    },
    {
      icon: <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-[#00A651]" />,
      bg: "bg-emerald-50",
      label: "Country",
      value: company?.country || "—",
    },
    {
      icon: <Icon icon="solar:hashtag-bold-duotone" className="w-5 h-5 text-[#00A651]" />,
      bg: "bg-[#EBF8F2]",
      label: "Company ID",
      value: company?.companyId || companyId || "—",
      mono: true,
    },
    {
      icon: <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      label: "Status",
      value: company?.status?.replace("_", " ").toUpperCase() || "ACTIVE",
    },
    {
      icon: <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
      label: "Approved",
      value: company?.approvedAt
        ? new Date(company.approvedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
        : "—",
    },
  ];

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Company Profile</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">
            Company Profile Overview · Request updates for Admin approval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-white/60">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${company?.status === "active" || company?.status === "approved" ? "bg-[#EBF8F2] text-[#00A651]" : "bg-amber-50 text-amber-600"}`}>
              {company?.status?.replace("_", " ") || "ACTIVE"}
            </span>
          </div>
          <div className="hidden md:block">
            <HeaderNotificationCenter />
          </div>
        </div>
      </div>

      {/* Pending Change Request Alert */}
      {pendingChange && pendingChange.status === "pending" && (
        <div className="p-6 bg-amber-50/80 backdrop-blur-md border border-amber-200/60 rounded-3xl shadow-md space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-amber-900 font-extrabold text-lg">
              <Icon icon="solar:clock-circle-bold-duotone" className="w-6 h-6 text-amber-600 animate-pulse" />
              Pending Profile Change Request
            </div>
            <span className="px-3 py-1 bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-widest rounded-full">
              Pending Admin Approval
            </span>
          </div>
          <p className="text-xs text-amber-800 font-medium">
            Requested on {new Date(pendingChange.requestedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Company Name</span>
              <div className="text-xs text-slate-400 line-through">{pendingChange.before?.companyName}</div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-1.5 mt-0.5">
                <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {pendingChange.after?.companyName}
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Business Sector</span>
              <div className="text-xs text-slate-400 line-through">{pendingChange.before?.businessSector}</div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-1.5 mt-0.5">
                <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {pendingChange.after?.businessSector}
              </div>
            </div>

            <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-1">Country</span>
              <div className="text-xs text-slate-400 line-through">{pendingChange.before?.country}</div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-1.5 mt-0.5">
                <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {pendingChange.after?.country}
              </div>
            </div>
          </div>

          {pendingChange.reason && (
            <div className="text-xs text-amber-900 bg-amber-100/60 p-3 rounded-xl border border-amber-200/50">
              <span className="font-bold">Reason provided:</span> "{pendingChange.reason}"
            </div>
          )}
        </div>
      )}

      {/* Approved Change Request Alert */}
      {pendingChange && pendingChange.status === "approved" && dismissedId !== pendingChange.id && (
        <div className="p-6 bg-[#EBF8F2]/80 backdrop-blur-md border border-[#00A651]/20 rounded-3xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between flex-wrap gap-3 pr-8">
            <div className="flex items-center gap-3 text-[#00A651] font-extrabold text-lg">
              <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6 text-[#00A651]" />
              Profile Change Request Approved
            </div>
            <span className="px-3 py-1 bg-[#00A651] text-white text-xs font-black uppercase tracking-widest rounded-full">
              Approved by Admin
            </span>
          </div>
          <button
            onClick={() => setDismissedId(pendingChange.id)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#00A651]/60 hover:text-[#00A651] hover:bg-[#00A651]/10 transition-colors"
            title="Dismiss Notice"
          >
            <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
          </button>
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            Your recent profile change request has been reviewed and approved by Admin. Your company details have been automatically updated.
          </p>
          {pendingChange.processedAt && (
            <p className="text-xs text-[#00A651] font-bold">
              Approved on {new Date(pendingChange.processedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      )}

      {/* Rejected Change Request Alert */}
      {pendingChange && pendingChange.status === "rejected" && dismissedId !== pendingChange.id && (
        <div className="p-6 bg-red-50/80 backdrop-blur-md border border-red-200/60 rounded-3xl shadow-md space-y-3 relative">
          <div className="flex items-center justify-between flex-wrap gap-3 pr-8">
            <div className="flex items-center gap-3 text-red-700 font-extrabold text-lg">
              <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6 text-red-600" />
              Profile Change Request Rejected
            </div>
            <span className="px-3 py-1 bg-red-200 text-red-900 text-xs font-black uppercase tracking-widest rounded-full">
              Rejected by Admin
            </span>
          </div>
          <button
            onClick={() => setDismissedId(pendingChange.id)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-red-400 hover:text-red-700 hover:bg-red-200/50 transition-colors"
            title="Dismiss Notice"
          >
            <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
          </button>
          <p className="text-sm text-red-900 font-medium">
            Your previous request to update company details was not approved. Your profile information remains unchanged.
          </p>
          {pendingChange.rejectReason && (
            <div className="p-3.5 bg-red-100/80 border border-red-200 rounded-2xl text-xs text-red-900 font-semibold">
              <span className="font-extrabold uppercase tracking-wider block text-[10px] text-red-700 mb-1">Rejection Reason:</span>
              "{pendingChange.rejectReason}"
            </div>
          )}
        </div>
      )}


      {/* Read-Only Info Notice */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-blue-500 shrink-0" />
        Official company profile records. Submit a change request to modify details.

      </div>

      {/* Profile Fields */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700" />
        <h3 className="text-2xl font-extrabold text-[#1F2937] mb-8 flex items-center gap-3">
          <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block" />
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
              <div className={`w-8 h-8 rounded-xl ${field.bg} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                {field.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">{field.label}</p>
                <p className={`text-lg font-black text-[#1F2937] truncate ${field.mono ? "font-mono text-base text-[#4B5563]" : ""}`}>
                  {field.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Change Section */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-[#1F2937] mb-2 flex items-center gap-2">
              <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5 text-[#00A651]" />
              Request Profile Change
            </h3>
            <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
              Submit requested updates for company name, business sector, or country. An Admin will review the before/after comparison and apply the changes.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={!!pendingChange && pendingChange.status === "pending"}
            className="rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-12 px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
          >
            <Icon icon="solar:pen-new-square-bold-duotone" className="w-4 h-4 mr-2" />
            {pendingChange && pendingChange.status === "pending" ? "Request Pending" : "Request Profile Change"}
          </Button>
        </div>
      </div>

      {/* Request Change Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/80 max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center font-bold">
                  <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#1F2937]">Request Profile Change</h3>
                  <p className="text-xs text-slate-500 font-medium">Submit new company details for Admin approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. PT Export Jaya Mandiri"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 font-semibold text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Sector <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessSector}
                  onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                  placeholder="e.g. Agricultural Products, Fisheries"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 font-semibold text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. Indonesia"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 font-semibold text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Change (Optional)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Briefly explain why this profile update is needed..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20 font-semibold text-sm transition-all resize-none"
                />
              </div>

              {!hasChanged && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
                  <Icon icon="solar:danger-circle-bold-duotone" className="w-4 h-4 text-amber-600 shrink-0" />
                  No changes detected. Modify at least one field to submit a change request.
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border-slate-200 font-bold hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={requestMutation.isPending || !hasChanged}
                  className="flex-1 h-12 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {requestMutation.isPending ? (
                    <><Icon icon="solar:refresh-circle-linear" className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Change Request"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
