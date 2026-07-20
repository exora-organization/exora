"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiDocuments } from "../../../../../lib/api/documents";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../../components/ui/card";
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
import { FileText, Download, Eye } from "lucide-react";
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
        link: `/export-case/${caseId}/costing`,
        linkLabel: "Configure Costing",
      };
    }
    if (lower.includes("pricing_results required") || lower.includes("pricing/calculate")) {
      return {
        type: "pricing",
        title: "Pricing Calculation Missing",
        description: "You must run the pricing calculation model for this case before generating reports.",
        link: `/export-case/${caseId}/pricing`,
        linkLabel: "Go to Pricing Setup",
      };
    }
    if (lower.includes("risk_assessment required") || lower.includes("risk-assessment")) {
      return {
        type: "risk",
        title: "Risk Assessment Missing",
        description: "You must perform the country and payment term risk assessment before generating reports.",
        link: `/export-case/${caseId}/risk`,
        linkLabel: "Assess Risks",
      };
    }
    if (lower.includes("advisor_recommendations required") || lower.includes("advisor/recommendations")) {
      return {
        type: "advisor",
        title: "AI Advisor Analysis Missing",
        description: "You must consult the AI Advisor and generate strategic recommendations before generating the feasibility report.",
        link: `/export-case/${caseId}/advisor`,
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
        <div>
          <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
            &larr; Back to Case Details
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Document Generation</h2>
          <p className="text-[#9CA3AF] mt-1">Generate and download official PDF reports securely built by the Exora backend.</p>
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

        <div className="grid md:grid-cols-2 gap-4">
          {role === "export_manager" && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" /> Quotation</CardTitle>
                <CardDescription>Generates a formal price quotation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateQuotationMut.mutate()} disabled={generateQuotationMut.isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {generateQuotationMut.isPending ? "Generating..." : "Generate & Preview Quotation"}
                </Button>
              </CardContent>
            </Card>
          )}

          {role === "export_manager" && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-500" /> Proforma Invoice</CardTitle>
                <CardDescription>Generates a proforma invoice for buyers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateProformaMut.mutate()} disabled={generateProformaMut.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  {generateProformaMut.isPending ? "Generating..." : "Generate & Preview Proforma Invoice"}
                </Button>
              </CardContent>
            </Card>
          )}

          {role === "finance_staff" && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-green-500" /> Cost Breakdown Report</CardTitle>
                <CardDescription>Detailed export cost breakdown analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateCostBreakdownMut.mutate()} disabled={generateCostBreakdownMut.isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  {generateCostBreakdownMut.isPending ? "Generating..." : "Generate & Preview Cost Breakdown"}
                </Button>
              </CardContent>
            </Card>
          )}

          {role === "company_owner" && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" /> Export Feasibility Report</CardTitle>
                <CardDescription>Comprehensive risk and feasibility report.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => generateFeasibilityMut.mutate()} disabled={generateFeasibilityMut.isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {generateFeasibilityMut.isPending ? "Generating..." : "Generate & Preview Feasibility Report"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No documents have been generated yet.</p>
                <p className="text-sm">Select a document type to begin.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Generated At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell className="font-medium">{doc.filename}</TableCell>
                      <TableCell>{formatDocType(doc.documentType)}</TableCell>
                      <TableCell>{new Date(doc.generatedAt).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className="bg-green-50 text-green-700">Generated</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(doc.documentId, doc.filename)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc.documentId, doc.filename)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
