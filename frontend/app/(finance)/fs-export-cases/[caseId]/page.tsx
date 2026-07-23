"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiExportCase } from "../../../../lib/api/export-case";
import { apiCosting } from "../../../../lib/api/costing";
import { apiFinancial } from "../../../../lib/api/financial";
import { apiPricing } from "../../../../lib/api/pricing";
import { apiRisk } from "../../../../lib/api/risk";
import { apiAdvisor } from "../../../../lib/api/advisor";
import { apiDocuments } from "../../../../lib/api/documents";
import { CaseSubNav } from "../../../../components/export-case/CaseSubNav";
import { CaseProgressStepper } from "../../../../components/export-case/CaseProgressStepper";
import { ViewOnlyBanner } from "../../../../components/export-case/ViewOnlyBanner";
import { StageNotReadyState } from "../../../../components/export-case/StageNotReadyState";
import { notificationStore } from "../../../../lib/services/notificationStore";
import { Button } from "../../../../components/ui/button";
import { toast } from "sonner";

export default function FinanceExportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = params.caseId as string;
  const currentTab = searchParams.get("tab") || "overview";
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleTabChange = (tabId: string) => {
    router.push(`/fs-export-cases/${caseId}?tab=${tabId}`);
  };

  const { data: caseData, isLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: costData } = useQuery({
    queryKey: ["costing", caseId],
    queryFn: () => apiCosting.getCostData(caseId),
    retry: false,
  });

  const { data: financialData } = useQuery({
    queryKey: ["financial", caseId],
    queryFn: () => apiFinancial.getAnalysis(caseId),
    retry: false,
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
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

  const handleGenerateCostReport = async () => {
    setIsGeneratingPdf(true);
    try {
      const res = await apiDocuments.generateCostBreakdown(caseId);
      if (res?.success) {
        toast.success("Cost Breakdown Report (PDF) generated successfully!");
        if (exportCase) {
          notificationStore.addNotification({
            caseId,
            caseName: exportCase.name,
            message: "Cost Breakdown Report (PDF) issued by Finance Staff. Ready for pricing & executive review.",
            targetRole: "export_manager",
            targetTab: "pricing",
          });
        }
      } else {
        toast.error("Failed to generate cost report.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate cost report.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div></div>;
  }

  const exportCase = caseData?.data;
  const costing = costData?.data;
  const financial = financialData?.data?.analysis;
  const pricing = pricingData?.data?.pricing;
  const risk = riskData?.data;
  const recommendation = advisorData?.data?.recommendation;

  if (!exportCase) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-bold">Failed to load export case details.</p>
        <Link href="/fs-export-cases">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>
    );
  }

  const allowedTabs = ["overview", "cost", "financial", "advisor", "documents"];
  if (!allowedTabs.includes(currentTab)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Icon icon="solar:shield-warning-bold-duotone" className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1F2937]">403 Access Restricted</h3>
        <p className="text-xs text-gray-500 font-semibold">
          Finance Staff role is not authorized to access or edit tab "{currentTab.toUpperCase()}". Please return to an allowed tab.
        </p>
        <Button onClick={() => handleTabChange("cost")} className="rounded-xl bg-[#00A651] font-bold text-xs">
          Open Costing Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link href="/fs-export-cases" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold rounded-xl shadow-md shadow-[#00A651]/20 transition-all">
        <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Export Cases
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1F2937]">{exportCase.name}</h2>
          <p className="text-xs text-[#6B7280] mt-1 font-medium">Finance Staff Workspace · EXORA Tenant Pro</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Product</p>
              <p className="text-base font-black text-[#1F2937]">{exportCase.product || "—"}</p>
            </div>
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Destination</p>
              <p className="text-base font-black text-[#1F2937]">{exportCase.destinationCountry}</p>
            </div>
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-5 shadow-sm">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Cost Status</p>
              <p className="text-base font-black text-emerald-600">
                {costing ? "Cost Data Complete" : "Cost Input Required"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Cost */}
      {currentTab === "cost" && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-[#1F2937]">Input & Configure Export Costs</h4>
            <Link href="/fs-costing" className="px-4 py-2 bg-[#00A651] text-white text-xs font-bold rounded-xl shadow-md">
              Open Full Costing Form
            </Link>
          </div>
          <p className="text-xs text-[#6B7280]">
            As Finance Staff, you are responsible for entering production, packaging, certification, freight, and logistics export cost components.
          </p>
        </div>
      )}

      {/* TAB CONTENT: Financial Analysis */}
      {currentTab === "financial" && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-extrabold text-[#1F2937]">Financial Viability Analysis & BEP</h4>
            <Link href="/fs-financial-analysis" className="px-4 py-2 bg-[#00A651] text-white text-xs font-bold rounded-xl shadow-md">
              Open Financial Analysis
            </Link>
          </div>
          <p className="text-xs text-[#6B7280]">
            Calculate Return on Investment (ROI), profit margins, and transaction Break-Even Point (BEP).
          </p>
        </div>
      )}

      {/* TAB CONTENT: Advisor */}
      {currentTab === "advisor" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="AI Advisor System" dataTopic="AI Smart Recommendations" />
          {recommendation ? (
            <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E8E3D9] text-xs font-medium leading-relaxed whitespace-pre-line">
              {recommendation.answer}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No AI recommendation generated yet.</p>
          )}
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {currentTab === "documents" && (
        <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-5">
          <h4 className="text-lg font-extrabold text-[#1F2937]">Cost Breakdown Report (PDF)</h4>
          <p className="text-xs text-[#6B7280]">
            As Finance Staff, you are authorized to issue official Cost Breakdown Reports for internal audit and record-keeping.
          </p>
          <Button
            onClick={handleGenerateCostReport}
            disabled={isGeneratingPdf}
            className="bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md"
          >
            Generate Cost Breakdown Report (PDF)
          </Button>
        </div>
      )}
    </div>
  );
}
