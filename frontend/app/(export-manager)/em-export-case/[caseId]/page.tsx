"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiExportCase } from "../../../../lib/api/export-case";
import { ExportCaseForm } from "../../../../components/export-case/ExportCaseForm";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { useUserProfile } from "../../../../hooks/useUserProfile";

export default function ExportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();
  const caseId = params.caseId as string;
  
  const canDelete = profile?.role === "export_manager" || profile?.role === "admin";

  const { data, isLoading, error } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiExportCase.delete(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["export-cases"] });
      router.push("/em-export-case");
    },
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error || !data?.data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load export case details.</p>
        <Link href="/em-export-case">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>
    );
  }

  const exportCase = data.data;

  const feasPct = exportCase.feasibilityScore != null ? exportCase.feasibilityScore * 10 : null;
  const feasLabel = feasPct == null ? "—" : feasPct >= 80 ? "High" : feasPct >= 60 ? "Moderate" : "Low";
  const feasColor = feasPct == null ? "text-gray-400" : feasPct >= 80 ? "text-emerald-700" : feasPct >= 60 ? "text-amber-700" : "text-rose-700";

  const pipelineSteps = [
    { href: "costing", title: "1. Costing", desc: "Input direct and indirect costs to calculate total expenses.", icon: "solar:calculator-bold-duotone", color: "text-[#00A651]", bg: "bg-[#EBF8F2]", grad: "from-emerald-50" },
    { href: "pricing", title: "2. Pricing & Incoterms", desc: "Select Incoterms and calculate your export pricing strategy.", icon: "solar:tag-price-bold-duotone", color: "text-blue-500", bg: "bg-blue-50", grad: "from-blue-50" },
    { href: "financial", title: "3. Financial Analysis", desc: "Review profitability margins and break-even points.", icon: "solar:graph-up-bold-duotone", color: "text-amber-500", bg: "bg-amber-50", grad: "from-amber-50" },
    { href: "scenario", title: "4. Scenario Analysis", desc: "Simulate what-if financial scenarios for the export.", icon: "solar:map-point-wave-bold-duotone", color: "text-green-500", bg: "bg-green-50", grad: "from-green-50" },
    { href: "risk", title: "5. Risk Assessment", desc: "Evaluate market, operational, and financial risks.", icon: "solar:shield-warning-bold-duotone", color: "text-rose-500", bg: "bg-rose-50", grad: "from-rose-50" },
    { href: "feasibility", title: "6. Feasibility Score", desc: "View the overall quantitative feasibility score.", icon: "solar:shield-check-bold-duotone", color: "text-emerald-600", bg: "bg-emerald-50", grad: "from-emerald-50" },
    { href: "advisor", title: "7. AI Recommendation", desc: "Get strategic AI advice based on your case data.", icon: "solar:magic-stick-3-bold-duotone", color: "text-emerald-500", bg: "bg-emerald-50", grad: "from-emerald-50" },
    { href: "documents", title: "8. Document Generation", desc: "Generate and download essential export documents.", icon: "solar:document-text-bold-duotone", color: "text-cyan-500", bg: "bg-cyan-50", grad: "from-cyan-50" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link href="/em-export-case" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all mb-5">
            <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Export Cases
          </Link>
          <h2 className="text-4xl font-extrabold text-[#1F2937] tracking-tight">{exportCase.name}</h2>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
              exportCase.status === "finalized" ? "bg-emerald-100 text-emerald-700" :
              exportCase.status === "in_review" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                exportCase.status === "finalized" ? "bg-emerald-500" :
                exportCase.status === "in_review" ? "bg-amber-500" :
                "bg-gray-500"
              }`}></span>
              {exportCase.status.replace("_", " ")}
            </span>
            <span className="text-sm font-semibold text-[#9CA3AF]">
              • Created {new Date(exportCase.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-2xl text-sm transition-all shadow-sm border border-red-100">
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" /> Delete Case
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-extrabold text-[#1F2937]">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-[#4B5563] mt-2">
                  This will permanently delete the export case <strong className="text-red-500">{exportCase.name}</strong> and remove all associated data from our servers. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="rounded-xl font-bold border-gray-200">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMutation.mutate();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, delete case"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Info Cards */}
          <div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-5 flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
              Case Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-blue-500"  />, bg: "bg-blue-50", label: "Product", value: exportCase.product || "—" },
                { icon: <Icon icon="solar:map-point-bold-duotone" className="w-6 h-6 text-emerald-600"  />, bg: "bg-emerald-50", label: "Destination", value: exportCase.destinationCountry },
                {
                  icon: <Icon icon="solar:shield-check-bold-duotone" className={`w-6 h-6 ${feasColor}`}  />,
                  bg: "bg-gray-50",
                  label: "Feasibility Score",
                  value: feasPct != null ? `${feasLabel} (${feasPct.toFixed(0)}/100)` : "Not analyzed yet",
                  valueColor: feasColor,
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-3xl p-6 flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-base font-black ${(item as any).valueColor || "text-[#1F2937]"}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline */}
          <div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-5 flex items-center gap-3">
              <span className="w-2 h-6 bg-[#00A651] rounded-full inline-block"></span>
              Export Analysis Pipeline
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {pipelineSteps.map((step, idx) => (
                <Link key={idx} href={`/em-export-case/${caseId}/${step.href}`}>
                  <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all rounded-3xl p-6 h-full flex flex-col group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${step.grad} to-transparent rounded-bl-full opacity-60 transition-opacity group-hover:opacity-100`}></div>
                    <div className="flex flex-col gap-4 flex-1 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center shrink-0`}>
                        <Icon icon={step.icon} className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <div>
                        <h4 className={`font-extrabold text-base text-[#1F2937] transition-colors ${step.color.replace('text-', 'group-hover:text-')}`}>{step.title}</h4>
                        <p className="text-xs font-semibold text-[#6B7280] mt-1.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 relative z-10">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-sm ${step.bg} ${step.color} group-hover:scale-105 group-hover:shadow-md border border-white/50`}>
                        <span className="text-xs font-bold tracking-wide">Open</span>
                        <Icon icon="solar:alt-arrow-right-bold-duotone" className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Form) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-5">
            <h3 className="text-xl font-bold text-[#1F2937] flex items-center gap-3">
              <span className="w-2 h-6 bg-amber-500 rounded-full inline-block"></span>
              {profile?.role === "export_manager" || profile?.role === "admin" ? "Edit Configuration" : "Configuration Details"}
            </h3>
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8">
              <ExportCaseForm initialData={exportCase} isEdit={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
