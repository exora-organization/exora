"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { apiAdvisor } from "../../../../../lib/api/advisor";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import { GenerateAdvisorRequest } from "../../../../../lib/types/advisor";
import { useState } from "react";

export default function AIAdvisorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;

  const [question, setQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const { data: advisorData, isLoading: advisorLoading, error: advisorError } = useQuery({
    queryKey: ["advisor", caseId],
    queryFn: () => apiAdvisor.getRecommendation(caseId),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateAdvisorRequest) => apiAdvisor.generateRecommendation(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", caseId] });
      setErrorMsg(null);
      setQuestion("");
    },
    onError: (error: any) => {
      if (error.message?.includes("timeout") || error.status === 504) {
        setErrorMsg("The AI service took too long to respond. Please try again.");
      } else if (error.status === 429) {
        setErrorMsg("AI request limit reached. Please try again later.");
      } else {
        setErrorMsg("Unable to generate recommendation. Please retry.");
      }
    }
  });

  if (caseLoading || advisorLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const recommendation = advisorData?.data?.recommendation;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;

  const handleGenerate = () => {
    generateMutation.mutate(question ? { question } : {});
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">AI Advisor</h2>
        <p className="text-[#9CA3AF] mt-1">Get intelligent export recommendations and feasibility summaries powered by the EXORA engine.</p>
      </div>

      {exportCase && (
        <Card className="bg-[#FAF8F3]">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Case Name</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Product</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Destination</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Active Incoterm</p>
              {activeIncoterm ? (
                <Badge variant="default" className="mt-1">{activeIncoterm}</Badge>
              ) : (
                <span className="text-sm text-[#9CA3AF] mt-1 block">Unknown</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {!recommendation && !advisorLoading && !advisorError && !errorMsg && (
        <Alert>
          <AlertTitle>No Recommendation Found</AlertTitle>
          <AlertDescription>
            No recommendation has been generated yet. Click "Generate AI Recommendation" to begin.
          </AlertDescription>
        </Alert>
      )}

      {advisorError && !recommendation && !errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Unable to Retrieve Recommendation</AlertTitle>
          <AlertDescription>
            We could not fetch your AI recommendation.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ask the Advisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional: Ask a specific question about your export case..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={generateMutation.isPending}
          />
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating AI recommendation..." : recommendation ? "Regenerate Recommendation" : "Generate AI Recommendation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {recommendation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F5F8F6] rounded-lg border border-[#E8E3D9]">
            <div className="flex items-center gap-2">
              <span className="text-[#2F6B4F] font-medium">AI Status:</span>
              <Badge className="bg-[#2F6B4F]">Generated</Badge>
            </div>
            <div className="text-sm text-[#9CA3AF]">
              Generated At: {new Date(recommendation.generatedAt).toLocaleString()}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advisor Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-[#1F2937] prose-a:text-[#2F6B4F] prose-strong:text-[#1F2937] text-[#4B5563] leading-relaxed">
                <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {pricingData?.data?.pricing && (
            <Card className="border-[#E8E3D9]">
              <CardHeader className="pb-3 border-b border-[#E8E3D9]">
                <CardTitle className="text-xl text-[#1F2937]">Cost Breakdown Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Total Freight</p>
                    <p className="text-lg font-bold text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.freight.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Insurance</p>
                    <p className="text-lg font-bold text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.insurance.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Total Cost</p>
                    <p className="text-lg font-bold text-[#1F2937]">
                      Rp {pricingData.data.pricing.totalCostIDR.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-[#FAF8F3] p-3 rounded-lg border border-[#E8E3D9]">
                    <p className="text-xs text-[#2F6B4F] font-bold uppercase tracking-wider mb-1">Final Selling Price</p>
                    <p className="text-xl font-extrabold text-[#2F6B4F]">
                      $ {pricingData.data.pricing.sellingPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button onClick={() => router.push(`/export-case/${caseId}/documents`)} variant="outline" size="lg" className="border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#FAF8F3]">
              View / Generate PDF Reports
            </Button>
            <Button onClick={() => router.push(`/export-case/${caseId}/documents`)} size="lg" className="bg-[#2F6B4F] hover:bg-[#25563F] text-white">
              Continue to Document Generation &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
