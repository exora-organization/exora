"use client";

import { Icon } from "@iconify/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../../lib/api/export-case";
import { apiPricing } from "../../../../lib/api/pricing";
import { apiCosting } from "../../../../lib/api/costing";
import { apiFinancial } from "../../../../lib/api/financial";
import { apiRisk } from "../../../../lib/api/risk";
import { apiAdvisor } from "../../../../lib/api/advisor";
import { CaseSubNav } from "../../../../components/export-case/CaseSubNav";
import { CaseProgressStepper } from "../../../../components/export-case/CaseProgressStepper";
import { ViewOnlyBanner } from "../../../../components/export-case/ViewOnlyBanner";
import { StageNotReadyState } from "../../../../components/export-case/StageNotReadyState";
import Link from "next/link";

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; icon: string }> = {
  draft: { bg: "bg-gray-800", text: "text-white", border: "border-gray-900", label: "Draft", icon: "solar:pen-new-square-bold-duotone" },
  in_review: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", label: "In Review", icon: "solar:clock-circle-bold-duotone" },
  finalized: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200", label: "Finalized", icon: "solar:check-circle-bold-duotone" },
};

export default function OwnerExportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = params.caseId as string;
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (tabId: string) => {
    router.push(`/own-export-cases/${caseId}?tab=${tabId}`);
  };

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: costData } = useQuery({
    queryKey: ["costing", caseId],
    queryFn: () => apiCosting.getCostData(caseId),
    retry: false,
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const { data: financialData } = useQuery({
    queryKey: ["financial", caseId],
    queryFn: () => apiFinancial.getAnalysis(caseId),
    retry: false,
  });

  const { data: riskData } = useQuery({
    queryKey: ["risk", caseId],
    queryFn: () => apiRisk.getRiskAssessment(caseId),
    retry: false,
  });

  const { data: advisorData } = useQuery({
    queryKey: ["advisor", caseId],
    queryFn: () => apiAdvisor.getRecommendation(caseId),
    retry: false,
  });

  if (caseLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 rounded-full border-b-4 border-[#00A651]" />
      </div>
    );
  }

  const ec = caseData?.data;
  const costing = costData?.data;
  const pricing = pricingData?.data?.pricing;
  const financial = financialData?.data?.analysis;
  const risk = riskData?.data?.assessment;
  const recommendation = advisorData?.data?.recommendation;

  if (!ec) {
    return (
      <div className="text-center py-20 text-[#9CA3AF] font-bold">
        Case not found or access denied.
      </div>
    );
  }

  const status = statusConfig[ec.status] || { bg: "bg-gray-800", text: "text-white", border: "border-gray-900", label: ec.status, icon: "solar:info-circle-bold-duotone" };
  const feasPct = ec.feasibilityScore != null ? ec.feasibilityScore * 10 : null;
  const feasLabel = feasPct == null ? "—" : feasPct >= 80 ? "High" : feasPct >= 60 ? "Moderate" : "Low";
  const feasColor = feasPct == null ? "text-gray-400" : feasPct >= 80 ? "text-emerald-700" : feasPct >= 60 ? "text-amber-700" : "text-rose-700";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link href="/own-export-cases" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-md shadow-[#00A651]/20 transition-all">
        <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Export Cases
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]">{ec.name}</h2>
          <p className="text-xs text-[#6B7280] mt-1 font-medium">Executive Case Overview · EXORA Tenant Pro</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-xs font-black uppercase tracking-widest ${status.bg} ${status.text} ${status.border} shadow-sm`}>
          <Icon icon={status.icon} className="w-4 h-4" />
          {status.label}
        </div>
      </div>

      {/* Case Sub Navigation Tabs */}
      <CaseSubNav activeTab={currentTab} onTabChange={handleTabChange} />

      {/* TAB CONTENT: Overview */}
      {currentTab === "overview" && (
        <div className="space-y-6">
          <CaseProgressStepper
            hasCostData={!!costing}
            hasPricingData={!!pricing}
            hasFinancialData={!!financial}
            hasRiskData={!!risk}
            hasAdvisorData={!!recommendation}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50", label: "Product", value: ec.product || "—" },
              { icon: <Icon icon="solar:map-point-bold-duotone" className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50", label: "Destination", value: ec.destinationCountry },
              { icon: <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50", label: "Created", value: new Date(ec.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) },
              {
                icon: <Icon icon="solar:shield-check-bold-duotone" className={`w-5 h-5 ${feasColor}`} />,
                bg: "bg-gray-50",
                label: "Feasibility Index",
                value: feasPct != null ? `${feasLabel} (${feasPct.toFixed(0)}/100)` : "Not scored",
                valueColor: feasColor,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center`}>{item.icon}</div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className={`text-sm font-black ${(item as any).valueColor || "text-[#1F2937]"}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Cost */}
      {currentTab === "cost" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Finance Staff" dataTopic="Export Costing Components" />
          {!costing ? (
            <StageNotReadyState
              currentStage="Export Costing Data"
              prerequisiteStage="Export Cost Input Form"
              responsibleRole="Finance Staff"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-[#1F2937]">Cost Breakdown Components</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Production / HPP</p>
                  <p className="text-sm font-black text-[#1F2937]">Rp {costing.hpp?.toLocaleString("id-ID") || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Packaging & Bundling</p>
                  <p className="text-sm font-black text-[#1F2937]">Rp {costing.packaging?.toLocaleString("id-ID") || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Freight & Logistics</p>
                  <p className="text-sm font-black text-[#1F2937]">Rp {costing.freight?.toLocaleString("id-ID") || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Pricing */}
      {currentTab === "pricing" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Export Manager" dataTopic="Pricing Strategy & Incoterms" />
          {!pricing ? (
            <StageNotReadyState
              currentStage="Pricing Engine"
              prerequisiteStage="Input Costing Data"
              responsibleRole="Export Manager"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-[#1F2937]">Pricing Calculation ({pricing.incoterm})</h4>
                <span className="px-3 py-1 bg-[#EBF8F2] text-[#00A651] text-xs font-black rounded-lg">
                  Target Margin: {pricing.targetMargin || 20}%
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <p className="text-[10px] text-emerald-700 uppercase">Selling Price (USD)</p>
                  <p className="text-base font-black text-emerald-800">$ {pricing.sellingPriceUSD?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "—"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Total Cost (IDR)</p>
                  <p className="text-sm font-black text-[#1F2937]">Rp {pricing.totalCostIDR?.toLocaleString("id-ID") || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Financial Analysis */}
      {currentTab === "financial" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Finance Staff" dataTopic="Financial Projections & BEP" />
          {!financial ? (
            <StageNotReadyState
              currentStage="Financial Analysis"
              prerequisiteStage="Pricing Simulation"
              responsibleRole="Finance Staff"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-[#1F2937]">Financial Projections & BEP</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Revenue (IDR)</p>
                  <p className="text-sm font-black text-[#1F2937]">Rp {financial.revenueIDR?.toLocaleString("id-ID") || "—"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Projected ROI</p>
                  <p className="text-sm font-black text-emerald-600">{financial.roiPct || 0}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Break-Even Point</p>
                  <p className="text-sm font-black text-[#1F2937]">{financial.breakEvenQty || 0} Units</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Risk */}
      {currentTab === "risk" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Export Manager" dataTopic="Country & Payment Risk Assessment" />
          {!risk ? (
            <StageNotReadyState
              currentStage="Risk Assessment"
              prerequisiteStage="Country Profile & Payment Terms"
              responsibleRole="Export Manager"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-[#1F2937]">Risk Assessment Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Country Risk</p>
                  <p className="text-sm font-black text-[#1F2937]">{risk.countryRiskLevel || "Low"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Feasibility Score</p>
                  <p className="text-sm font-black text-emerald-600">{risk.feasibilityScore || 83.5} / 100</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Advisor */}
      {currentTab === "advisor" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Export Manager & AI System" dataTopic="AI Smart Recommendations" />
          {!recommendation ? (
            <StageNotReadyState
              currentStage="AI Advisor Recommendations"
              prerequisiteStage="Transaction Data Synthesis"
              responsibleRole="AI System / Export Manager"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
                <Icon icon="solar:lightbulb-bold-duotone" className="w-5 h-5 text-amber-500" />
                AI Advisor Strategic Recommendations
              </h4>
              <p className="text-xs font-medium text-[#4B5563] leading-relaxed whitespace-pre-line bg-[#FAF8F3] p-4 rounded-2xl border border-[#E8E3D9]">
                {recommendation.answer || "AI Recommendation active."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {currentTab === "documents" && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-[#1F2937]">Executive Feasibility Report (PDF)</h4>
            <Link href="/own-feasibility-report" className="px-4 py-2 bg-[#00A651] text-white text-xs font-bold rounded-xl shadow-md">
              Open PDF Portal
            </Link>
          </div>
          <p className="text-xs text-[#6B7280]">
            As Company Owner, you have full authority to download complete executive feasibility reports covering all export transaction parameters.
          </p>
        </div>
      )}
    </div>
  );
}
