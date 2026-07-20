"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiFinancial } from "../../../lib/api/financial";
import { apiPricing } from "../../../lib/api/pricing";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Lightbulb, BrainCircuit, ShieldAlert, ChevronDown, 
  Loader2, AlertTriangle, CheckCircle, Clock, Scale 
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export default function FinanceAiAdvisorPage() {
  const queryClient = useQueryClient();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const { data: finData, isLoading: finLoading } = useQuery({
    queryKey: ["financial-analysis", selectedCaseId],
    queryFn: () => apiFinancial.getAnalysis(selectedCaseId),
    enabled: !!selectedCaseId,
    retry: false,
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", selectedCaseId],
    queryFn: () => apiPricing.getPricing(selectedCaseId),
    enabled: !!selectedCaseId,
    retry: false,
  });

  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ["advisor", selectedCaseId],
    queryFn: () => apiAdvisor.getRecommendation(selectedCaseId),
    enabled: !!selectedCaseId,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiAdvisor.generateRecommendation(selectedCaseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", selectedCaseId] });
      setQuestion("");
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to generate AI recommendation.");
    }
  });

  const cases = casesData?.data?.items || [];
  const selectedCase = cases.find(c => c.caseId === selectedCaseId);
  const analysis = finData?.data?.analysis;
  const pricing = pricingData?.data?.pricing;
  const recommendation = advisorData?.data?.recommendation;

  const handleGenerate = () => {
    if (!selectedCaseId) return;
    generateMutation.mutate(question ? { question } : {});
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">AI Advisor</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-1">
          Review profitability warnings, financial risk narratives, and payment terms security (FR-009a)
        </p>
      </div>

      {/* Case Selector */}
      <Card className="border-[#E8E3D9] shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-extrabold">Select Export Case to Analyze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 pr-10 text-sm font-semibold outline-none text-[#1F2937] disabled:opacity-60 cursor-pointer"
              value={selectedCaseId}
              onChange={(e) => { setSelectedCaseId(e.target.value); setErrorMsg(null); }}
              disabled={casesLoading}
            >
              <option value="">— Select a case —</option>
              {cases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.name} · {c.destinationCountry}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </CardContent>
      </Card>

      {selectedCaseId && (
        <div className="space-y-6">
          
          {/* Detailed Financial & Risk Commentary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profitability Guidance */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50/50 pb-3">
                <CardTitle className="text-sm font-bold text-purple-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Profitability Guidance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {finLoading ? (
                  <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                    <Loader2 className="w-3 animate-spin" /> Loading profit metrics...
                  </div>
                ) : analysis ? (
                  <>
                    {analysis.profitMarginPct < 15.0 ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block mb-0.5">Below Target Margin</span>
                          Actual profit margin ({analysis.profitMarginPct.toFixed(2)}%) fails to satisfy target trade threshold (15.0%). Suggest adjusting logistics parameters or renegotiating freight charges.
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block mb-0.5">Satisfactory Margin</span>
                          Actual profit margin ({analysis.profitMarginPct.toFixed(2)}%) meets recommended margin benchmarks.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-rose-600 font-bold">
                    Costing sheet incomplete. Profit margins cannot be simulated.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Term Commentary */}
            <Card className="border-blue-100">
              <CardHeader className="bg-blue-50/40 pb-3">
                <CardTitle className="text-sm font-bold text-blue-950 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Payment Term Risk Commentary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs text-gray-600 leading-relaxed font-semibold">
                <p className="mb-2">
                  Payment term parameters hold a <strong className="text-gray-900">20% risk factor weight</strong> in general feasibility indices (FR-015).
                </p>
                <p>
                  Current case uses simulated trade configurations. Securing payments via Irrevocable Letters of Credit (L/C) minimizes buyer default compared to open accounts.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ask the Advisor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-extrabold">Ask the Advisor (Scoped Trade-Finance RAG)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A651] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ask specific questions regarding trade financing, L/C rules, or currency margins..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={generateMutation.isPending}
              />
              <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="bg-[#00A651] hover:bg-[#008F44]">
                  {generateMutation.isPending ? "Generating..." : "Query Advisor"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Advisor Response */}
          {advisorLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#00A651]" />
            </div>
          ) : recommendation ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#FAF8F3] rounded-xl border border-[#E8E3D9]">
                <div className="flex items-center gap-2">
                  <span className="text-[#00A651] font-bold text-sm">Response Status:</span>
                  <Badge className="bg-[#00A651]">Ready</Badge>
                </div>
                <div className="text-xs text-gray-500 font-bold">
                  Generated: {new Date(recommendation.generatedAt).toLocaleString()}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-extrabold">Advisor Strategy Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed font-semibold">
                    <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 font-bold bg-gray-50 rounded-xl">
              No recommendations generated yet. Query the advisor to fetch trade references.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
