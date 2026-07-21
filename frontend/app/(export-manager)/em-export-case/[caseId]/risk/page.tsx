"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiRisk } from "../../../../../lib/api/risk";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";

export default function RiskAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const { data: riskData, isLoading: riskLoading, error: riskError } = useQuery({
    queryKey: ["risk-assessment", caseId],
    queryFn: () => apiRisk.getRiskAssessment(caseId),
    retry: false,
  });

  if (caseLoading || riskLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const assessment = riskData?.data?.assessment;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;

  const renderFeasibilityBadge = (feasibility: string | undefined) => {
    if (!feasibility) return null;
    if (feasibility.includes("High")) return <Badge className="bg-green-500 hover:bg-green-600">{feasibility}</Badge>;
    if (feasibility.includes("Moderate")) return <Badge className="bg-yellow-500 hover:bg-yellow-600">{feasibility}</Badge>;
    return <Badge variant="destructive">{feasibility}</Badge>;
  };

  const renderRiskBadge = (level: string | undefined) => {
    if (!level) return null;
    if (level === "Low") return <Badge className="bg-green-500 hover:bg-green-600">Low Risk</Badge>;
    if (level === "Medium") return <Badge className="bg-yellow-500 hover:bg-yellow-600">Moderate Risk</Badge>;
    return <Badge variant="destructive">High Risk</Badge>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={`/em-export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Risk Assessment</h2>
        <p className="text-[#6B7280] mt-1 font-medium">Review the comprehensive risk analysis generated from your financial models.</p>
      </div>

      {exportCase && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Product</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Active Incoterm</p>
              {activeIncoterm ? (
                <Badge className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-full px-3">{activeIncoterm}</Badge>
              ) : (
                <span className="text-sm text-[#9CA3AF] mt-1 block font-bold">Unknown</span>
              )}
            </div>
          </div>
        </div>
      )}

      {riskError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to load risk assessment. Ensure that costing, pricing, and financial analysis steps are completed.
          </AlertDescription>
        </Alert>
      )}

      {!assessment && !riskLoading && !riskError && (
        <Alert>
          <AlertTitle>No Assessment Found</AlertTitle>
          <AlertDescription>
            Risk assessment is not available. Please complete the previous analysis steps first.
          </AlertDescription>
        </Alert>
      )}

      {assessment && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/60 hover:-translate-y-1">
            <div>
              <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-2">Overall Feasibility</p>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-[#1F2937]">{assessment.feasibilityScore.toFixed(1)} <span className="text-[#6B7280] text-2xl font-bold">/ 100</span></span>
                <div className="scale-110 origin-left">
                  {renderFeasibilityBadge(assessment.feasibilityClass)}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">Calculated At</p>
              <p className="text-sm font-bold mt-1 text-[#4B5563]">{new Date(assessment.calculatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <h3 className="text-xl font-extrabold text-[#1F2937]">Country Risk</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-black text-[#1F2937]">{assessment.countryRiskScore.toFixed(0)}</span>
                    <div className="scale-110">{renderRiskBadge(assessment.countryRiskLevel)}</div>
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                    Evaluates the economic and political stability of <strong className="text-[#1F2937] font-extrabold">{assessment.destinationCountry}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <h3 className="text-xl font-extrabold text-[#1F2937]">Payment Risk</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-black text-[#1F2937]">{assessment.paymentTermScore.toFixed(0)}</span>
                  </div>
                  <p className="text-sm font-extrabold text-blue-600 mb-2">{assessment.paymentTerm}</p>
                  <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                    Assesses the reliability of the chosen payment method in securing funds.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <h3 className="text-xl font-extrabold text-[#1F2937]">Profitability Risk</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-black text-[#1F2937]">{assessment.profitabilityScore.toFixed(0)}</span>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                      <span className="text-[#9CA3AF] font-bold">Actual Margin</span>
                      <span className="font-extrabold text-[#1F2937]">{assessment.actualMarginPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                      <span className="text-[#9CA3AF] font-bold">Target Margin</span>
                      <span className="font-extrabold text-[#1F2937]">{assessment.targetMarginPct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                    Measures the gap between the actual projected margin and the company's target margin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/em-export-case/${caseId}/advisor`)} className="bg-[#00A651] hover:bg-[#008F44] text-white rounded-full px-8 h-12 text-[13px] font-bold shadow-md hover:shadow-lg transition-all group">
              Continue to AI Advisor <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
