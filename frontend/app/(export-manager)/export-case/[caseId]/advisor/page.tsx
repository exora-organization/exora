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
import { useUserProfile } from "../../../../../hooks/useUserProfile";
import { Lightbulb, DollarSign, Scale, ArrowRight, Download, Eye } from "lucide-react";
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
        ? `/export-cases/${caseId}/documents/quotation`
        : `/export-cases/${caseId}/documents/proforma-invoice`;

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
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">AI Advisor</h2>
        <p className="text-gray-500 mt-1">Get intelligent export recommendations and feasibility summaries powered by the EXORA engine.</p>
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

      {(errorMsg || advisorLoadError) && (
        <Alert variant="destructive" className="rounded-2xl border-red-200">
          <AlertTitle className="font-extrabold uppercase tracking-wider text-xs mb-1">Error</AlertTitle>
          <AlertDescription className="font-medium text-sm">
            {isEmailVerificationError ? (
              <div className="space-y-3">
                <p>Email verification is required to access AI Advisor features. Please verify your email address first.</p>
                <button
                  onClick={() => router.push(`/verify-email?redirect=/export-case/${caseId}/advisor`)}
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
          <Card className="border-blue-100 hover:shadow-md transition-shadow">
            <CardHeader className="bg-blue-50/50 pb-3">
              <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Incoterm Scenario Guidance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm text-gray-600 font-medium">
              <p>EXORA recommends the following shipping scenario optimizations:</p>
              <ul className="space-y-2 list-disc pl-4 text-xs">
                <li><strong className="text-gray-900">FOB (Free on Board)</strong>: Recommended to minimize sea freight liability while retaining local port dispatch control.</li>
                <li><strong className="text-gray-900">CIF (Cost, Insurance & Freight)</strong>: Choose only if you have negotiated volume insurance rates to secure additional margins.</li>
                <li><strong className="text-gray-900">EXW (Ex Works)</strong>: Safest logistics route, but severely limits profitability optimization.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Pricing Sensitivity Notes */}
          <Card className="border-emerald-100 hover:shadow-md transition-shadow">
            <CardHeader className="bg-emerald-50/50 pb-3">
              <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Pricing Sensitivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-sm text-gray-600 font-medium">
              <p>Exchange rate and cost margin fluctuation vulnerabilities:</p>
              <ul className="space-y-2 list-disc pl-4 text-xs">
                <li><strong className="text-gray-900">FX Buffer</strong>: A 5% depreciation in IDR relative to USD impacts your net pricing margin by approximately 1.8%.</li>
                <li><strong className="text-gray-900">Target Margin</strong>: Configured at 15%. Any freight cost escalation of &gt;10% requires adjusting the FOB price to maintain target profits.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ask the Advisor Form */}
      <Card>
        <CardHeader>
          <CardTitle>Consult Export Advisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A651] disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Optional: Ask a specific question about your export case..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={generateMutation.isPending}
          />
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="bg-[#00A651] hover:bg-[#008F44]">
              {generateMutation.isPending ? "Consulting..." : recommendation ? "Regenerate Analysis" : "Run Advisor Check"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
          <div className="flex items-center justify-between p-4 bg-[#FAF8F3] rounded-xl border border-[#E8E3D9]">
            <div className="flex items-center gap-2">
              <span className="text-[#00A651] font-extrabold text-sm">AI Response Status:</span>
              <Badge className="bg-[#00A651]">Ready</Badge>
            </div>
            <div className="text-xs text-gray-500 font-bold">
              Generated: {new Date(recommendation.generatedAt).toLocaleString()}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advisor Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base max-w-none text-[#4B5563] leading-relaxed font-medium">
                <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Pricing data panel if exists */}
          {pricingData?.data?.pricing && (
            <Card className="border-[#E8E3D9]">
              <CardHeader className="pb-3 border-b border-[#E8E3D9] bg-gray-50/50">
                <CardTitle className="text-lg text-[#1F2937]">Case Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Freight</p>
                    <p className="text-base font-extrabold text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.freight.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Insurance</p>
                    <p className="text-base font-extrabold text-[#1F2937]">
                      Rp {pricingData.data.pricing.breakdown.insurance.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Case Cost</p>
                    <p className="text-base font-extrabold text-[#1F2937]">
                      Rp {pricingData.data.pricing.totalCostIDR.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-[#FAF8F3] p-3 rounded-lg border border-[#E8E3D9]">
                    <p className="text-xs text-[#00A651] font-bold uppercase tracking-wider mb-1">FOB Price (USD)</p>
                    <p className="text-xl font-black text-[#00A651]">
                      $ {pricingData.data.pricing.sellingPriceUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report download actions depending on role */}
          {role === "export_manager" && (
            <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-extrabold text-[#1F2937]">Export Documents</p>
                <p className="text-xs text-gray-500">Generate and preview the case Quotation and Proforma Invoice PDFs.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleDownloadPDF("quotation")} 
                  disabled={isGeneratingPdf} 
                  variant="outline" 
                  className="border-gray-300 text-gray-700 bg-white"
                >
                  <Eye className="w-4 h-4 mr-2" /> Quotation (PDF)
                </Button>
                <Button 
                  onClick={() => handleDownloadPDF("proforma")} 
                  disabled={isGeneratingPdf} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Eye className="w-4 h-4 mr-2" /> Proforma (PDF)
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
