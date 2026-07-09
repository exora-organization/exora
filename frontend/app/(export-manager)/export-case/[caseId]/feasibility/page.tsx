"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRisk } from "../../../../../lib/api/risk";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../../../components/ui/card";
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-[#1F2937]">Feasibility Score</h2>
        <p className="text-[#9CA3AF] mt-1">Review the overall quantitative feasibility assessment for this export case.</p>
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
          <Card className="border-[#E8E3D9] shadow-sm overflow-hidden">
            <div className="bg-[#FAF8F3]/50 p-6 flex flex-col md:flex-row items-center justify-between border-b border-[#E8E3D9]">
              <div className="text-center md:text-left space-y-1 mb-4 md:mb-0">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Overall Rating</span>
                <h3 className="text-2xl font-bold text-[#1F2937]">{assessment.feasibilityClass}</h3>
                <p className="text-xs text-[#9CA3AF]">Calculated At: {new Date(assessment.calculatedAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border border-[#E8E3D9] rounded-full h-32 w-32 shadow-sm">
                <span className="text-3xl font-extrabold text-slate-850">{(assessment.feasibilityScore / 10).toFixed(1)}</span>
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mt-1">Out of 10</span>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="text-sm text-[#4B5563] leading-relaxed">
                The overall feasibility score represents a weighted average of three core indices: **Profitability** (50%), **Country Trade Risk** (30%), and **Payment Term Safety** (20%). 
                A score of **{(assessment.feasibilityScore / 10).toFixed(1)}** indicates **{assessment.feasibilityClass}** for exporting to **{assessment.destinationCountry}**.
              </div>
            </CardContent>
          </Card>

          {/* Weighted Components Breakdown */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profitability (50%) */}
            <Card className="border-[#E8E3D9] shadow-sm">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Weight: 50%</span>
                <CardTitle className="text-base font-bold text-[#1F2937]">Profitability Index</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-[#1F2937]">{assessment.profitabilityScore.toFixed(0)} / 100</div>
                <div className="space-y-1.5 text-xs text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>Actual Margin:</span>
                    <span className="font-semibold text-[#4B5563]">{assessment.actualMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Margin:</span>
                    <span className="font-semibold text-[#4B5563]">{assessment.targetMarginPct.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Country Risk (30%) */}
            <Card className="border-[#E8E3D9] shadow-sm">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Weight: 30%</span>
                <CardTitle className="text-base font-bold text-[#1F2937]">Country Trade Risk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-[#1F2937]">{assessment.countryRiskScore.toFixed(0)} / 100</div>
                <div className="space-y-1.5 text-xs text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="font-semibold text-[#4B5563]">{assessment.destinationCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span className="font-semibold text-[#4B5563]">{assessment.countryRiskLevel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Term Safety (20%) */}
            <Card className="border-[#E8E3D9] shadow-sm">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Weight: 20%</span>
                <CardTitle className="text-base font-bold text-[#1F2937]">Payment Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-[#1F2937]">{assessment.paymentTermScore.toFixed(0)} / 100</div>
                <div className="space-y-1.5 text-xs text-[#9CA3AF]">
                  <div className="flex justify-between">
                    <span>Payment Term:</span>
                    <span className="font-semibold text-[#4B5563]">{assessment.paymentTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Rating:</span>
                    <span className="font-semibold text-[#4B5563]">
                      {assessment.paymentTermScore >= 80 ? "High Safety" : "Moderate Safety"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
