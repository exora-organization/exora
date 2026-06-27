"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
        <p className="text-gray-500 mt-1">Get intelligent export recommendations and feasibility summaries powered by the EXORA engine.</p>
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
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 font-medium">AI Status:</span>
              <Badge className="bg-indigo-600">Generated</Badge>
            </div>
            <div className="text-sm text-indigo-400">
              Generated At: {new Date(recommendation.generatedAt).toLocaleString()}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advisor Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base max-w-none prose-slate whitespace-pre-wrap">
                {recommendation.answer}
              </div>
            </CardContent>
          </Card>

          {(recommendation.sources?.length ?? 0) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sources Consulted</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  {recommendation.sources!.map((source, idx) => (
                    <li key={idx}>{source}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/export-case/${caseId}/documents`)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue to Document Generation &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
