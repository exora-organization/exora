"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { apiAdvisor } from "../../../../../lib/api/advisor";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import { GenerateAdvisorRequest } from "../../../../../lib/types/advisor";
import { useState } from "react";
import { useUserProfile } from "../../../../../hooks/useUserProfile";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { apiClient } from "../../../../../lib/api/client";
import { PdfPreviewModal } from "../../../../../components/ui/pdf-preview-modal";
import { auth } from "../../../../../lib/firebase/client";

export default function AIAdvisorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;
  const { role } = useUserProfile();

  const [question, setQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ open: boolean; documentId: string; filename: string }>({ open: false, documentId: "", filename: "" });

  const openPreview = (documentId: string, filename: string) => {
    setPreviewModal({ open: true, documentId, filename });
  };

  const handleBlobDownload = async (documentId: string, filename: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch(`${API_BASE_URL}/documents/${documentId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`"${filename}" downloaded!`);
    } catch (err: any) {
      toast.error(err.message || "Download failed.");
    }
  };

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

  const handleGenerate = () => {
    generateMutation.mutate(question ? { question } : {});
  };

  const handleDownloadPDF = async (reportType: "quotation" | "proforma") => {
    setIsGeneratingPdf(true);
    try {
      const endpoint = reportType === "quotation"
        ? `/own-export-cases/${caseId}/documents/quotation`
        : `/own-export-cases/${caseId}/documents/proforma-invoice`;

      const res = await apiClient<any>(endpoint, { method: "POST" });
      if (res.success) {
        toast.success(`${reportType.toUpperCase()} generated successfully!`);
        const doc = res.data;
        if (doc?.documentId && doc?.filename) {
          setTimeout(() => openPreview(doc.documentId, doc.filename), 300);
        }
      } else {
        toast.error(`Failed to generate ${reportType}.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate document.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (caseLoading || advisorLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const recommendation = advisorData?.data?.recommendation;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;

  // Surface the initial advisor load error (e.g. EMAIL_NOT_VERIFIED)
  const advisorLoadError = advisorError
    ? ((advisorError as any)?.message || String(advisorError))
    : null;
  const isEmailVerificationError =
    advisorLoadError?.toLowerCase().includes("email verification") ||
    (advisorError as any)?.code === "EMAIL_NOT_VERIFIED";

  return (
    <>
      <PdfPreviewModal
        open={previewModal.open}
        onClose={() => setPreviewModal((s) => ({ ...s, open: false }))}
        documentId={previewModal.documentId}
        filename={previewModal.filename}
      />
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={`/em-export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">AI Advisor</h2>
        <p className="text-[#6B7280] font-medium mt-1">Get intelligent export recommendations and feasibility summaries powered by the EXORA engine.</p>
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
                <div className="mt-1 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">{activeIncoterm}</div>
              ) : (
                <span className="text-sm text-[#9CA3AF] mt-1 block font-bold">Unknown</span>
              )}
            </div>
          </div>
        </div>
      )}

      {(errorMsg || advisorLoadError) && (
        <Alert variant="destructive" className="rounded-2xl border-red-200">
          <AlertTitle className="font-extrabold uppercase tracking-wider text-xs mb-1">Error</AlertTitle>
          <AlertDescription className="font-medium text-sm">
            {isEmailVerificationError ? (
              <div className="space-y-3">
                <p>Email verification is required to access AI Advisor features. Please verify your email address first.</p>
                <button
                  onClick={() => router.push(`/verify-email?redirect=/em-export-case/${caseId}/advisor`)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
                >
                  Verify Email Address
                </button>
              </div>
            ) : (
              errorMsg || advisorLoadError
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Incoterm Scenario Guidance & Pricing Sensitivity (Visible for Export Manager) */}
      {role === "export_manager" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incoterm Scenario Guidance */}
          <div className="bg-blue-50/90 backdrop-blur-xl border border-blue-100 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-blue-100/50 backdrop-blur-sm border-b border-blue-200 px-6 py-5">
              <h3 className="text-xl font-extrabold text-blue-900 flex items-center gap-2">
                <Icon icon="solar:scale-bold-duotone" className="w-5 h-5 text-blue-600" />
                Incoterm Scenario Guidance
              </h3>
            </div>
            <div className="p-6 space-y-3 text-sm text-[#4B5563] font-medium">
              <p>EXORA recommends the following shipping scenario optimizations:</p>
              <ul className="space-y-3 list-disc pl-4 text-xs">
                <li><strong className="text-[#1F2937] font-bold">FOB (Free on Board)</strong>: Recommended to minimize sea freight liability while retaining local port dispatch control.</li>
                <li><strong className="text-[#1F2937] font-bold">CIF (Cost, Insurance & Freight)</strong>: Choose only if you have negotiated volume insurance rates to secure additional margins.</li>
                <li><strong className="text-[#1F2937] font-bold">EXW (Ex Works)</strong>: Safest logistics route, but severely limits profitability optimization.</li>
              </ul>
            </div>
          </div>

          {/* Pricing Sensitivity Notes */}
          <div className="bg-emerald-50/90 backdrop-blur-xl border border-emerald-100 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-emerald-100/50 backdrop-blur-sm border-b border-emerald-200 px-6 py-5">
              <h3 className="text-xl font-extrabold text-emerald-900 flex items-center gap-2">
                <Icon icon="solar:dollar-minimalistic-bold-duotone" className="w-5 h-5 text-emerald-600" />
                Pricing Sensitivity Analysis
              </h3>
            </div>
            <div className="p-6 space-y-3 text-sm text-[#4B5563] font-medium">
              <p>Exchange rate and cost margin fluctuation vulnerabilities:</p>
              <ul className="space-y-3 list-disc pl-4 text-xs">
                <li><strong className="text-[#1F2937] font-bold">FX Buffer</strong>: A 5% depreciation in IDR relative to USD impacts your net pricing margin by approximately 1.8%.</li>
                <li><strong className="text-[#1F2937] font-bold">Target Margin</strong>: Configured at 15%. Any freight cost escalation of &gt;10% requires adjusting the FOB price to maintain target profits.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ask the Advisor Form */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
        <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
          <h3 className="text-xl font-extrabold text-[#1F2937]">Consult Export Advisor</h3>
        </div>
        <div className="p-6 space-y-4">
          <textarea
            className="flex min-h-[100px] w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#00A651] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional: Ask a specific question about your export case..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={generateMutation.isPending}
          />
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="h-12 rounded-full px-8 bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all">
              {generateMutation.isPending ? "Consulting..." : recommendation ? "Regenerate Analysis" : "Run Advisor Check"}
            </Button>
          </div>
        </div>
      </div>

      {!recommendation && !advisorLoading && !advisorError && !errorMsg && (
        <Alert>
          <AlertTitle>No Active Strategy Found</AlertTitle>
          <AlertDescription>
            No recommendations generated. Click "Run Advisor Check" to query RAG database details.
          </AlertDescription>
        </Alert>
      )}

      {recommendation && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-white/90 backdrop-blur-xl shadow-md rounded-2xl border border-white/60">
            <div className="flex items-center gap-3">
              <span className="text-[#00A651] font-extrabold text-sm uppercase tracking-widest">AI Response Status:</span>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">Ready</div>
            </div>
            <div className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">
              Generated: {new Date(recommendation.generatedAt).toLocaleString()}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
              <h3 className="text-xl font-extrabold text-[#1F2937]">Advisor Report</h3>
            </div>
            <div className="p-8">
              <div className="prose prose-sm md:prose-base max-w-none text-[#4B5563] leading-relaxed font-medium">
                <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Pricing data panel if exists */}
          {pricingData?.data?.pricing && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="bg-[#FAF8F3]/50 backdrop-blur-sm border-b border-[#E8E3D9] px-6 py-5">
                <h3 className="text-xl font-extrabold text-[#1F2937]">Case Cost Summary</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-1">Freight</p>
                    <p className="text-lg font-black text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.freight.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-1">Insurance</p>
                    <p className="text-lg font-black text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.insurance.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-1">Total Case Cost</p>
                    <p className="text-lg font-black text-[#1F2937]">
                      Rp {pricingData.data.pricing.totalCostIDR.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-[#FAF8F3] p-4 rounded-2xl border border-[#E8E3D9]">
                    <p className="text-[10px] text-[#00A651] font-bold uppercase tracking-widest mb-1">FOB Price (USD)</p>
                    <p className="text-2xl font-black text-[#00A651]">
                      $ {pricingData.data.pricing.sellingPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report download actions depending on role */}
          {role === "export_manager" && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-xl font-extrabold text-[#1F2937]">Export Documents</p>
                <p className="text-sm text-[#6B7280] font-medium mt-1">Generate and preview the case Quotation and Proforma Invoice PDFs.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => handleDownloadPDF("quotation")} 
                  disabled={isGeneratingPdf} 
                  className="flex-1 sm:flex-none h-12 rounded-full px-6 bg-white border border-[#E5E7EB] text-[#1F2937] font-bold text-[13px] shadow-sm hover:shadow-md hover:bg-[#F9FAFB] transition-all"
                >
                  <Icon icon="solar:document-bold-duotone" className="w-5 h-5 mr-2 text-[#9CA3AF]" /> Quotation
                </Button>
                <Button 
                  onClick={() => handleDownloadPDF("proforma")} 
                  disabled={isGeneratingPdf} 
                  className="flex-1 sm:flex-none h-12 rounded-full px-6 bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all"
                >
                  <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 mr-2" /> Proforma
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
