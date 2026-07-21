"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiFinancial } from "../../lib/api/financial";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { useUserProfile } from "../../hooks/useUserProfile";
import { Label } from "../ui/label";
import { Download, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { apiClient } from "../../lib/api/client";
import { toast } from "sonner";
import { PdfPreviewModal } from "../ui/pdf-preview-modal";

interface FinancialAnalysisProps {
  caseId: string;
  backUrl: string;
}

export function FinancialAnalysis({ caseId, backUrl }: FinancialAnalysisProps) {
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();
  
  const [selectedIncoterm, setSelectedIncoterm] = useState<"EXW" | "FOB" | "CFR" | "CIF">("FOB");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ open: boolean; documentId: string; filename: string }>({ open: false, documentId: "", filename: "" });

  const handleDownloadCostBreakdown = async () => {
    setIsGeneratingPdf(true);
    try {
      const res = await apiClient<any>(`/export-cases/${caseId}/documents/cost-breakdown-report`, {
        method: "POST",
      });
      if (res.success) {
        toast.success("Cost Breakdown Report PDF generated successfully!");
        const doc = res.data;
        if (doc?.documentId && doc?.filename) {
          setTimeout(() => setPreviewModal({ open: true, documentId: doc.documentId, filename: doc.filename }), 300);
        }
      } else {
        toast.error("Failed to generate report PDF.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const canRecalculate = profile?.role === "finance_staff" || profile?.role === "admin" || profile?.role === "export_manager";

  const { data, isLoading, error } = useQuery({
    queryKey: ["financial-analysis", caseId],
    queryFn: () => apiFinancial.getAnalysis(caseId),
  });

  const mutation = useMutation({
    mutationFn: () => apiFinancial.recalculateAnalysis(caseId, { incoterm: selectedIncoterm }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-analysis", caseId] });
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to recalculate financial analysis.");
    }
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="mb-5 flex justify-between items-center">
          <Link href={backUrl} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
            <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
          </Link>
        </div>

        <div className="flex flex-col items-center gap-4 p-10 bg-white/90 backdrop-blur-xl border border-red-200 shadow-xl rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-full opacity-50 -z-10" />
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-12 h-12 text-red-500" />
          <div>
            <p className="text-lg font-extrabold text-red-900 mb-1">Analysis Unavailable</p>
            <p className="text-sm text-red-700 font-semibold max-w-xl mx-auto">
              The financial analysis could not be loaded. Please ensure that the Cost Data and Pricing modules have been completed first before viewing financial metrics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const analysis = data?.data?.analysis;

  if (!analysis) {
    return <div className="p-8 text-center text-gray-500">No data available.</div>;
  }

  return (
    <>
      <PdfPreviewModal
        open={previewModal.open}
        onClose={() => setPreviewModal((s) => ({ ...s, open: false }))}
        documentId={previewModal.documentId}
        filename={previewModal.filename}
      />
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={backUrl} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Financial Analysis</h2>
        <p className="text-[#6B7280] mt-1 font-medium">Review profitability margins and break-even points generated by the system.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-extrabold text-[#1F2937] mb-6">Generated Financial Metrics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Revenue (IDR)</p>
                <p className="text-2xl font-extrabold text-green-700">Rp {(analysis.revenueIDR || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Gross Profit (IDR)</p>
                <p className="text-2xl font-extrabold text-blue-700">Rp {(analysis.grossProfitIDR || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Profit Margin (%)</p>
                <p className="text-2xl font-extrabold text-indigo-700">{(analysis.profitMarginPct || 0).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Return on Investment (ROI)</p>
                <p className="text-2xl font-extrabold text-purple-700">{(analysis.roiPct || 0).toFixed(2)}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Break Even Point (Quantity)</p>
                <p className="text-2xl font-extrabold text-[#1F2937]">{Math.ceil(analysis.breakEvenQty || 0).toLocaleString()} units</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform">
            <h3 className="text-xl font-extrabold text-[#1F2937] mb-6">Base Cost & Pricing Factors</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
                <span className="text-sm font-bold text-[#4B5563]">Total Base Cost (IDR)</span>
                <span className="font-extrabold text-[#1F2937]">Rp {(analysis.totalCostIDR || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-3">
                <span className="text-sm font-bold text-[#4B5563]">Calculated Selling Price (IDR)</span>
                <span className="font-extrabold text-[#1F2937]">Rp {(analysis.sellingPriceIDR || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-sm font-bold text-[#4B5563]">Sales Quantity</span>
                <span className="font-extrabold text-[#1F2937]">{(analysis.quantity || 0).toLocaleString()} units</span>
              </div>
            </div>
          </div>

          {profile?.role === "finance_staff" && (
            <div className="bg-purple-50/90 backdrop-blur-xl border border-purple-200 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="bg-purple-100/50 backdrop-blur-sm border-b border-purple-200 px-6 py-5">
                <h3 className="text-xl font-extrabold text-purple-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  Finance AI Advisor Panel
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Profitability Guidance */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Profitability Guidance</h4>
                  {(analysis.profitMarginPct || 0) < 15.0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block mb-1">Target Margin Warning</span>
                        <p className="font-medium">Actual profit margin ({(analysis.profitMarginPct || 0).toFixed(2)}%) is below the recommended 15.0% target parameters. Recommend adjusting transportation charges or negotiating cheaper ocean freight.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex gap-3 items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block mb-1">Target Margin Met</span>
                        <p className="font-medium">Actual profit margin ({(analysis.profitMarginPct || 0).toFixed(2)}%) satisfies target trade threshold (15.0%).</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Term Risk Commentary */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Payment Term Risk commentary</h4>
                  <p className="text-[#4B5563] text-sm leading-relaxed font-medium">
                    Payment terms hold a <span className="font-extrabold text-[#1F2937]">20% risk factor weight</span> in calculations (FR-015). Ensure secure methods like Irrevocable Letters of Credit (L/C) are requested to minimize counterparty defaults compared to open accounts.
                  </p>
                </div>

                {/* Financial Risk Narrative */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Financial Risk Narrative</h4>
                  <p className="text-[#4B5563] text-sm leading-relaxed font-medium">
                    Profitability and margins are calculated based on simulated quantity configurations. Guard selling parameters by verifying fixed Incoterm logistics costs to avoid exposure to shipping rate spikes.
                  </p>
                </div>

                {/* Report Download */}
                <div className="pt-4 border-t border-purple-200/50 flex justify-between items-center">
                  <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">Report Authorization</span>
                  <Button 
                    onClick={handleDownloadCostBreakdown} 
                    disabled={isGeneratingPdf} 
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[13px] h-12 px-6 font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGeneratingPdf ? "Generating..." : "Generate & Preview Cost Breakdown"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50/90 backdrop-blur-xl border border-blue-200 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-blue-100/50 backdrop-blur-sm border-b border-blue-200 px-6 py-5">
              <h3 className="text-xl font-extrabold text-blue-900">Recalculate Analysis</h3>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-4 text-sm bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="incoterm" className="font-bold text-[#1F2937]">Simulate with Incoterm</Label>
                <div className="relative">
                  <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    id="incoterm"
                    className="appearance-none flex h-12 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedIncoterm}
                    onChange={(e) => setSelectedIncoterm(e.target.value as "EXW" | "FOB" | "CFR" | "CIF")}
                    disabled={!canRecalculate || mutation.isPending}
                  >
                    <option value="EXW">EXW (Ex Works)</option>
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CFR">CFR (Cost and Freight)</option>
                    <option value="CIF">CIF (Cost, Insurance, and Freight)</option>
                  </select>
                </div>
                <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-2">
                  Currently active: <span className="text-blue-600">{analysis.selectedIncoterm}</span>
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <Button 
                className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all" 
                onClick={() => mutation.mutate()}
                disabled={!canRecalculate || mutation.isPending || selectedIncoterm === analysis.selectedIncoterm}
              >
                {mutation.isPending ? "Recalculating..." : "Recalculate Metrics"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

