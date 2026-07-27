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
import { apiScenario } from "../../../../lib/api/scenario";
import { apiDocuments } from "../../../../lib/api/documents";
import { CaseSubNav } from "../../../../components/export-case/CaseSubNav";
import { CaseProgressStepper } from "../../../../components/export-case/CaseProgressStepper";
import { ViewOnlyBanner } from "../../../../components/export-case/ViewOnlyBanner";
import { StageNotReadyState } from "../../../../components/export-case/StageNotReadyState";
import { CostingForm } from "../../../../components/export-case/CostingForm";
import { FinancialAnalysis } from "../../../../components/export-case/FinancialAnalysis";
import { AIAdvisorWorkspace } from "../../../../components/export-case/AIAdvisorWorkspace";
import { ScenarioComparisonMatrix } from "../../../../components/export-case/ScenarioComparisonMatrix";

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

  const { data: scenariosData } = useQuery({
    queryKey: ["scenarios", caseId],
    queryFn: () => apiScenario.list(caseId),
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
  const risk = riskData?.data?.assessment;
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
        <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase border ${
          exportCase.status === "finalized" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          exportCase.status === "in_review" ? "bg-amber-50 text-amber-800 border-amber-200" :
          "bg-gray-50 text-gray-700 border-gray-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            exportCase.status === "finalized" ? "bg-emerald-500" :
            exportCase.status === "in_review" ? "bg-amber-500" :
            "bg-gray-500"
          }`}></span>
          {exportCase.status.replace("_", " ")}
        </span>
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
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm">
            <h4 className="text-lg font-extrabold text-[#1F2937]">Input & Configure Export Costs</h4>
            <p className="text-xs text-[#6B7280] mt-1">
              As Finance Staff, enter production HPP, packaging, freight, target margin, and payment terms for <strong>{exportCase.name}</strong>.
            </p>
          </div>
          <CostingForm caseId={caseId} initialData={costing} />
        </div>
      )}


      {/* TAB CONTENT: Pricing */}
      {currentTab === "pricing" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Export Manager" dataTopic="Pricing Strategy & Incoterms" />
          {!pricing ? (
            <StageNotReadyState
              currentStage="Pricing Strategy"
              prerequisiteStage="Cost Data Input"
              responsibleRole="Export Manager"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-extrabold text-[#1F2937]">Calculated Pricing ({pricing.incoterm})</h4>
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
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] text-blue-600 uppercase">Exchange Rate</p>
                  <p className="text-sm font-black text-blue-900">Rp {pricing.exchangeRate?.toLocaleString("id-ID") || "—"} / USD</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Profit (IDR)</p>
                  <p className="text-sm font-black text-emerald-600">Rp {pricing.profitIDR?.toLocaleString("id-ID") || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Scenario */}
      {currentTab === "scenario" && (
        <div className="space-y-6">
          <ViewOnlyBanner ownerRoleName="Export Manager" dataTopic="Transaction Scenario Simulation" />
          <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-3">
            <h4 className="text-base font-extrabold text-[#1F2937]">Transaction Scenarios (Managed by Export Manager)</h4>
            <p className="text-xs text-[#6B7280]">
              Export Manager simulates alternative market conditions, Incoterm variations, and margin overrides for this case.
            </p>
          </div>
          <ScenarioComparisonMatrix scenarios={scenariosData?.data?.scenarios || []} />
        </div>
      )}

      {/* TAB CONTENT: Financial Analysis */}
      {currentTab === "financial" && (
        <FinancialAnalysis caseId={caseId} hideBackButton />
      )}

      {/* TAB CONTENT: Risk */}
      {currentTab === "risk" && (
        <div className="space-y-4">
          <ViewOnlyBanner ownerRoleName="Export Manager" dataTopic="Country & Payment Risk Assessment" />
          {!risk ? (
            <StageNotReadyState
              currentStage="Risk Assessment"
              prerequisiteStage="Financial Analysis & Pricing"
              responsibleRole="Export Manager"
            />
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-4">
              <h4 className="text-base font-extrabold text-[#1F2937]">Risk Assessment Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] text-gray-400 uppercase">Country Risk Level</p>
                  <p className="text-sm font-black text-[#1F2937]">{risk.countryRiskLevel || "Low"}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] text-blue-600 uppercase">Payment Method Score</p>
                  <p className="text-sm font-black text-blue-900">{risk.paymentTermScore || 100} / 100</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl">
                  <p className="text-[10px] text-purple-600 uppercase">Profitability Score</p>
                  <p className="text-sm font-black text-purple-900">{risk.profitabilityScore ? risk.profitabilityScore.toFixed(0) : "—"} / 100</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <p className="text-[10px] text-emerald-600 uppercase">Overall Feasibility</p>
                  <p className="text-sm font-black text-emerald-700">{risk.feasibilityScore ? risk.feasibilityScore.toFixed(1) : "—"} / 100 ({risk.feasibilityClass || "High"})</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}




      {/* TAB CONTENT: Advisor */}
      {currentTab === "advisor" && (
        <AIAdvisorWorkspace caseId={caseId} />
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
