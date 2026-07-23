"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiFinancial } from "../../../lib/api/financial";
import { apiPricing } from "../../../lib/api/pricing";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Icon } from "@iconify/react";
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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">AI Advisor</h2>
        <p className="text-sm text-[#4B5563] font-medium mt-2">
          Review profitability warnings, financial risk narratives, and payment terms security
        </p>
      </div>

      {/* Case Selector */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8">
        <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3 mb-6">
          <span className="w-2.5 h-6 bg-[#00A651] rounded-full" />
          Select Export Case to Analyze
        </h3>
        <div className="relative max-w-xl">
          <select
            className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 pr-12 text-sm font-bold outline-none text-[#1F2937] disabled:opacity-60 cursor-pointer focus:ring-2 focus:ring-[#00A651]/20 transition-all shadow-sm"
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
          <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651] pointer-events-none" />
        </div>
      </div>

      {selectedCaseId && (
        <div className="space-y-6">
          
          {/* Detailed Financial & Risk Commentary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profitability Guidance */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-all hover:shadow-2xl">
              <h3 className="text-lg font-bold text-[#1F2937] flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] flex items-center justify-center">
                  <Icon icon="solar:graph-up-bold-duotone" className="w-5 h-5 text-[#00A651]" />
                </div>
                Profitability Guidance
              </h3>
              
              <div className="pt-2">
                {finLoading ? (
                  <div className="text-sm text-gray-400 font-bold flex items-center gap-2">
                    <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-4 h-4 animate-spin" /> Loading profit metrics...
                  </div>
                ) : analysis ? (
                  <>
                    {analysis.profitMarginPct < 15.0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-sm flex gap-3 items-start shadow-sm">
                        <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block mb-1 text-amber-900">Below Target Margin</span>
                          Actual profit margin ({analysis.profitMarginPct.toFixed(2)}%) fails to satisfy target trade threshold (15.0%). Suggest adjusting logistics parameters or renegotiating freight charges.
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-sm flex gap-3 items-start shadow-sm">
                        <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block mb-1 text-emerald-900">Satisfactory Margin</span>
                          Actual profit margin ({analysis.profitMarginPct.toFixed(2)}%) meets recommended margin benchmarks.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-rose-600 font-bold bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-2">
                    <Icon icon="solar:danger-triangle-bold-duotone" className="w-5 h-5" /> Costing sheet incomplete. Profit margins cannot be simulated.
                  </div>
                )}
              </div>
            </div>

            {/* Payment Term Commentary */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-all hover:shadow-2xl">
              <h3 className="text-lg font-bold text-blue-950 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Icon icon="solar:scale-bold-duotone" className="w-5 h-5 text-blue-600" />
                </div>
                Payment Term Risk Commentary
              </h3>
              
              <div className="pt-2 text-sm text-gray-700 leading-relaxed font-medium bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB]">
                <p className="mb-3">
                  Payment term parameters hold a <strong className="text-[#1F2937] font-black">20% risk factor weight</strong> in general feasibility indices.
                </p>
                <p>
                  Current case uses simulated trade configurations. Securing payments via Irrevocable Letters of Credit (L/C) minimizes buyer default compared to open accounts.
                </p>
              </div>
            </div>
          </div>

          {/* Ask the Advisor */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3 mb-6">
              <span className="w-2.5 h-6 bg-[#00A651] rounded-full" />
              Ask the Advisor <span className="text-gray-400 font-semibold text-sm">(Scoped Trade-Finance RAG)</span>
            </h3>
            
            <div className="space-y-4">
              <textarea
                className="flex min-h-[120px] w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A651]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-inner"
                placeholder="Ask specific questions regarding trade financing, L/C rules, or currency margins..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={generateMutation.isPending}
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleGenerate} 
                  disabled={generateMutation.isPending} 
                  className="bg-[#00A651] hover:bg-[#008F44] disabled:bg-gray-400 text-white font-bold rounded-full px-8 py-3.5 shadow-md shadow-[#00A651]/20 transition-all flex items-center gap-2"
                >
                  {generateMutation.isPending ? (
                    <><Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-5 h-5 animate-spin" /> Generating...</>
                  ) : (
                    <><Icon icon="solar:magic-stick-3-bold-duotone" className="w-5 h-5" /> Query Advisor</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Advisor Response */}
          {advisorLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-full shadow-lg flex items-center gap-3 text-[#00A651] font-bold">
                <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-6 h-6 animate-spin" /> Fetching AI Analysis...
              </div>
            </div>
          ) : recommendation ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between p-5 bg-[#EBF8F2]/80 backdrop-blur border border-[#00A651]/30 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00A651] rounded-full flex items-center justify-center shadow-md">
                    <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[#1F5c34] font-extrabold block">Response Status: Ready</span>
                    <span className="text-[#00A651] text-xs font-bold">AI generation successful</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#1F5c34] font-bold uppercase tracking-widest bg-white/50 px-4 py-2 rounded-xl">
                  Generated: {new Date(recommendation.generatedAt).toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00A651] to-emerald-300"></div>
                <h3 className="text-2xl font-extrabold text-[#1F2937] mb-6 flex items-center gap-3">
                  <Icon icon="solar:document-text-bold-duotone" className="w-7 h-7 text-[#00A651]" />
                  Advisor Strategy Report
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium bg-[#FAFCFB] p-6 rounded-2xl border border-[#F3F4F6]">
                  <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 font-bold bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-inner">
              <Icon icon="solar:ghost-smile-bold-duotone" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No recommendations generated yet.<br/>Query the advisor above to fetch trade references.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
