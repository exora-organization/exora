"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiDocuments } from "../../../../../lib/api/documents";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { Icon } from "@iconify/react";
import { useUserProfile } from "../../../../../hooks/useUserProfile";
import { PdfPreviewModal } from "../../../../../components/ui/pdf-preview-modal";
import { toast } from "sonner";
import { auth } from "../../../../../lib/firebase/client";

export default function DocumentGenerationPage() {
  const { profile } = useUserProfile();
  const role = profile?.role;
  
  const params = useParams();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PDF Preview modal state
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    documentId: string;
    filename: string;
  }>({ open: false, documentId: "", filename: "" });

  const openPreview = (documentId: string, filename: string) => {
    setPreviewModal({ open: true, documentId, filename });
  };

  const getMissingPrerequisite = (msg: string | null) => {
    if (!msg) return null;
    const lower = msg.toLowerCase();
    if (lower.includes("cost_data required")) {
      return {
        type: "costing",
        title: "Costing Data Missing",
        description: "You must input and save direct and indirect costs for this case before generating reports.",
        link: `/em-export-case/${caseId}/costing`,
        linkLabel: "Configure Costing",
      };
    }
    if (lower.includes("pricing_results required") || lower.includes("pricing/calculate")) {
      return {
        type: "pricing",
        title: "Pricing Calculation Missing",
        description: "You must run the pricing calculation model for this case before generating reports.",
        link: `/em-export-case/${caseId}/pricing`,
        linkLabel: "Go to Pricing Setup",
      };
    }
    if (lower.includes("risk_assessment required") || lower.includes("risk-assessment")) {
      return {
        type: "risk",
        title: "Risk Assessment Missing",
        description: "You must perform the country and payment term risk assessment before generating reports.",
        link: `/em-export-case/${caseId}/risk`,
        linkLabel: "Assess Risks",
      };
    }
    if (lower.includes("advisor_recommendations required") || lower.includes("advisor/recommendations")) {
      return {
        type: "advisor",
        title: "AI Advisor Analysis Missing",
        description: "You must consult the AI Advisor and generate strategic recommendations before generating the feasibility report.",
        link: `/em-export-case/${caseId}/advisor`,
        linkLabel: "Consult AI Advisor",
      };
    }
    return null;
  };

  const missingInfo = getMissingPrerequisite(errorMsg);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => apiDocuments.listDocuments(caseId),
  });

  const handleGenerateSuccess = (data: any) => {
    queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    setErrorMsg(null);
    // Auto-open preview for the freshly generated document
    const doc = data?.data;
    if (doc?.documentId && doc?.filename) {
      setTimeout(() => openPreview(doc.documentId, doc.filename), 300);
    }
  };

  const handleGenerateError = (error: any) => {
    setErrorMsg(error.message || "Failed to generate document. Please ensure all prerequisite data exists.");
  };

  const generateQuotationMut = useMutation({
    mutationFn: () => apiDocuments.generateQuotation(caseId),
    onSuccess: handleGenerateSuccess,
    onError: handleGenerateError,
  });

  const generateProformaMut = useMutation({
    mutationFn: () => apiDocuments.generateProformaInvoice(caseId),
    onSuccess: handleGenerateSuccess,
    onError: handleGenerateError,
  });

  const generateCostBreakdownMut = useMutation({
    mutationFn: () => apiDocuments.generateCostBreakdown(caseId),
    onSuccess: handleGenerateSuccess,
    onError: handleGenerateError,
  });

  const generateFeasibilityMut = useMutation({
    mutationFn: () => apiDocuments.generateFeasibility(caseId),
    onSuccess: handleGenerateSuccess,
    onError: handleGenerateError,
  });

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      setErrorMsg(null);
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
    } catch (error: any) {
      setErrorMsg("Unable to download document.");
      toast.error("Download failed.");
    }
  };

  if (caseLoading || docsLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;
  const documents = docsData?.data?.items || [];

  const formatDocType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
          <Link href={`/em-export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
            <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
          </Link>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Document Generation</h2>
          <p className="text-[#6B7280] font-medium mt-1">Generate and download official PDF reports securely built by the Exora backend.</p>
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

        {errorMsg && missingInfo && (
          <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-md rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <AlertTitle className="text-lg font-black text-red-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
                {missingInfo.title}
              </AlertTitle>
              <AlertDescription className="text-sm font-semibold text-red-700/90 leading-relaxed">
                {missingInfo.description}
              </AlertDescription>
            </div>
            <Link href={missingInfo.link} className="shrink-0">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-6 py-3 rounded-2xl h-auto shadow-md">
                {missingInfo.linkLabel}
              </Button>
            </Link>
          </Alert>
        )}

        {errorMsg && !missingInfo && (
          <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-md rounded-3xl p-6">
            <AlertTitle className="text-lg font-black text-red-800">Error</AlertTitle>
            <AlertDescription className="text-sm font-semibold text-red-700/90 mt-1 leading-relaxed">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {role === "export_manager" && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 mb-2"><Icon icon="solar:document-text-bold-duotone" className="h-6 w-6 text-blue-500" /> Quotation</h3>
                <p className="text-[#6B7280] font-medium text-sm mb-6">Generates a formal price quotation.</p>
              </div>
              <Button onClick={() => generateQuotationMut.mutate()} disabled={generateQuotationMut.isPending} className="w-full h-12 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all">
                {generateQuotationMut.isPending ? "Generating..." : "Generate & Preview Quotation"}
              </Button>
            </div>
          )}

          {role === "export_manager" && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 mb-2"><Icon icon="solar:document-text-bold-duotone" className="h-6 w-6 text-indigo-500" /> Proforma Invoice</h3>
                <p className="text-[#6B7280] font-medium text-sm mb-6">Generates a proforma invoice for buyers.</p>
              </div>
              <Button onClick={() => generateProformaMut.mutate()} disabled={generateProformaMut.isPending} className="w-full h-12 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all">
                {generateProformaMut.isPending ? "Generating..." : "Generate & Preview Proforma Invoice"}
              </Button>
            </div>
          )}

          {role === "finance_staff" && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 mb-2"><Icon icon="solar:document-text-bold-duotone" className="h-6 w-6 text-emerald-500" /> Cost Breakdown Report</h3>
                <p className="text-[#6B7280] font-medium text-sm mb-6">Detailed export cost breakdown analysis.</p>
              </div>
              <Button onClick={() => generateCostBreakdownMut.mutate()} disabled={generateCostBreakdownMut.isPending} className="w-full h-12 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all">
                {generateCostBreakdownMut.isPending ? "Generating..." : "Generate & Preview Cost Breakdown"}
              </Button>
            </div>
          )}

          {role === "company_owner" && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2 mb-2"><Icon icon="solar:document-text-bold-duotone" className="h-6 w-6 text-purple-500" /> Export Feasibility Report</h3>
                <p className="text-[#6B7280] font-medium text-sm mb-6">Comprehensive risk and feasibility report.</p>
              </div>
              <Button onClick={() => generateFeasibilityMut.mutate()} disabled={generateFeasibilityMut.isPending} className="w-full h-12 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all">
                {generateFeasibilityMut.isPending ? "Generating..." : "Generate & Preview Feasibility Report"}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
          <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
            <h3 className="text-xl font-extrabold text-[#1F2937]">Generated Documents</h3>
          </div>
          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-10 text-[#9CA3AF]">
                <Icon icon="solar:document-text-bold-duotone" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="font-medium">No documents have been generated yet.</p>
                <p className="text-sm">Select a document type to begin.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-[#6B7280]">Document Name</TableHead>
                    <TableHead className="font-bold text-[#6B7280]">Type</TableHead>
                    <TableHead className="font-bold text-[#6B7280]">Generated At</TableHead>
                    <TableHead className="font-bold text-[#6B7280]">Status</TableHead>
                    <TableHead className="text-right font-bold text-[#6B7280]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell className="font-extrabold text-[#1F2937]">{doc.filename}</TableCell>
                      <TableCell className="font-medium text-[#4B5563]">{formatDocType(doc.documentType)}</TableCell>
                      <TableCell className="text-[#6B7280] font-medium">{new Date(doc.generatedAt).toLocaleString()}</TableCell>
                      <TableCell><div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-[10px] uppercase tracking-widest">Generated</div></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(doc.documentId, doc.filename)}
                            className="text-[#00A651] hover:text-[#008F44] hover:bg-green-50 font-bold rounded-full transition-colors"
                          >
                            <Icon icon="solar:eye-bold-duotone" className="h-5 w-5 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.documentId, doc.filename)}
                            className="text-[#1F2937] hover:text-black hover:bg-gray-100 font-bold rounded-full transition-colors"
                          >
                            <Icon icon="solar:download-square-bold-duotone" className="h-5 w-5 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
