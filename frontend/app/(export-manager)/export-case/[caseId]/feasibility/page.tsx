"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiRisk } from "../../../../../lib/api/risk";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";

export default function FeasibilityScorePage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: ["risk-assessment", caseId],
    queryFn: () => apiRisk.getRiskAssessment(caseId),
  });

  const assessment = assessmentData?.data?.assessment;

  const getFeasibilityBadgeColor = (classification: string) => {
    switch (classification) {
      case "High Feasibility":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Moderate Feasibility":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low Feasibility":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-[#F5F8F6] text-[#1F2937] border-[#E8E3D9]";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={`/export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Feasibility Score</h2>
        <p className="text-[#6B7280] mt-1 font-medium">Review the overall quantitative feasibility assessment for this export case.</p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-[#9CA3AF]">Loading feasibility assessment...</div>
      ) : error || !assessment ? (
        <Alert variant="destructive">
          <AlertTitle>No Assessment Found</AlertTitle>
          <AlertDescription>
            Prerequisite data missing. Please ensure cost data is saved and pricing is calculated to generate the feasibility score.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Main Score Visualizer */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-[#FAF8F3]/50 p-8 flex flex-col md:flex-row items-center justify-between border-b border-[#E8E3D9]">
              <div className="text-center md:text-left space-y-1 mb-6 md:mb-0">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Overall Rating</span>
                <h3 className="text-3xl font-extrabold text-[#1F2937]">{assessment.feasibilityClass}</h3>
                <p className="text-xs font-bold text-[#9CA3AF] mt-2">Calculated At: {new Date(assessment.calculatedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border border-[#E8E3D9] rounded-full h-32 w-32 shadow-lg">
                <span className="text-4xl font-black text-slate-800">{(assessment.feasibilityScore / 10).toFixed(1)}</span>
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">Out of 10</span>
              </div>
            </div>
            <div className="p-6">
              <div className="text-sm font-medium text-[#4B5563] leading-relaxed">
                The overall feasibility score represents a weighted average of three core indices: <strong className="text-[#1F2937] font-extrabold">Profitability</strong> (50%), <strong className="text-[#1F2937] font-extrabold">Country Trade Risk</strong> (30%), and <strong className="text-[#1F2937] font-extrabold">Payment Term Safety</strong> (20%). 
                A score of <strong className="text-[#1F2937] font-extrabold">{(assessment.feasibilityScore / 10).toFixed(1)}</strong> indicates <strong className="text-[#1F2937] font-extrabold">{assessment.feasibilityClass}</strong> for exporting to <strong className="text-[#1F2937] font-extrabold">{assessment.destinationCountry}</strong>.
              </div>
            </div>
          </div>

          {/* Weighted Components Breakdown */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profitability (50%) */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Weight: 50%</span>
                <h3 className="text-xl font-extrabold text-[#1F2937] mt-1">Profitability Index</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="text-4xl font-black text-[#1F2937]">{assessment.profitabilityScore.toFixed(0)} <span className="text-lg text-[#9CA3AF]">/ 100</span></div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Actual Margin:</span>
                    <span className="font-extrabold text-[#4B5563]">{assessment.actualMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Target Margin:</span>
                    <span className="font-extrabold text-[#4B5563]">{assessment.targetMarginPct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Country Risk (30%) */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Weight: 30%</span>
                <h3 className="text-xl font-extrabold text-[#1F2937] mt-1">Country Trade Risk</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="text-4xl font-black text-[#1F2937]">{assessment.countryRiskScore.toFixed(0)} <span className="text-lg text-[#9CA3AF]">/ 100</span></div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Destination:</span>
                    <span className="font-extrabold text-[#4B5563] truncate ml-2">{assessment.destinationCountry}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Risk Level:</span>
                    <span className="font-extrabold text-[#4B5563]">{assessment.countryRiskLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Term Safety (20%) */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col h-full">
              <div className="pb-4">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Weight: 20%</span>
                <h3 className="text-xl font-extrabold text-[#1F2937] mt-1">Payment Safety</h3>
              </div>
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="text-4xl font-black text-[#1F2937]">{assessment.paymentTermScore.toFixed(0)} <span className="text-lg text-[#9CA3AF]">/ 100</span></div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Payment Term:</span>
                    <span className="font-extrabold text-[#4B5563] truncate ml-2">{assessment.paymentTerm}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="text-[#9CA3AF] font-bold">Safety Rating:</span>
                    <span className="font-extrabold text-[#4B5563]">
                      {assessment.paymentTermScore >= 80 ? "High Safety" : "Moderate Safety"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
