"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRisk } from "../../../../../lib/api/risk";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
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
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Risk Assessment</h2>
        <p className="text-gray-500 mt-1">Review the comprehensive risk analysis generated from your financial models.</p>
      </div>

      {exportCase && (
        <Card className="bg-slate-50">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Case Name</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Product</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Destination</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Incoterm</p>
              {activeIncoterm ? (
                <Badge variant="default" className="mt-1">{activeIncoterm}</Badge>
              ) : (
                <span className="text-sm text-gray-400 mt-1 block">Unknown</span>
              )}
            </div>
          </CardContent>
        </Card>
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
          <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-lg shadow-sm">
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Overall Feasibility</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{assessment.feasibilityScore.toFixed(1)} <span className="text-slate-500 text-xl">/ 100</span></span>
                {renderFeasibilityBadge(assessment.feasibilityClass)}
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm font-medium">Calculated At</p>
              <p className="text-sm">{new Date(assessment.calculatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Country Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold">{assessment.countryRiskScore.toFixed(0)}</span>
                  {renderRiskBadge(assessment.countryRiskLevel)}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Evaluates the economic and political stability of <strong>{assessment.destinationCountry}</strong>.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payment Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold">{assessment.paymentTermScore.toFixed(0)}</span>
                </div>
                <p className="text-sm font-medium text-blue-600 mt-2">{assessment.paymentTerm}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Assesses the reliability of the chosen payment method in securing funds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Profitability Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold">{assessment.profitabilityScore.toFixed(0)}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Actual Margin</span>
                    <span className="font-medium">{assessment.actualMarginPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Target Margin</span>
                    <span className="font-medium">{assessment.targetMarginPct.toFixed(1)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Measures the gap between the actual projected margin and the company's target margin.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/export-case/${caseId}/advisor`)} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Continue to AI Advisor &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
