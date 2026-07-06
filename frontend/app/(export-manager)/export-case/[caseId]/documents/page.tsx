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
import { FileText, Download } from "lucide-react";

export default function DocumentGenerationPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;

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

  const { data: docsData, isLoading: docsLoading } = useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => apiDocuments.listDocuments(caseId),
  });

  const handleGenerateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    setErrorMsg(null);
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

  const handleDownload = async (documentId: string) => {
    try {
      setErrorMsg(null);
      const res = await apiDocuments.getDownloadUrl(documentId);
      if (res.data?.downloadUrl) {
        window.open(res.data.downloadUrl, "_blank");
      }
    } catch (error: any) {
      setErrorMsg("Unable to retrieve download URL.");
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Document Generation</h2>
        <p className="text-gray-500 mt-1">Generate and download official PDF reports securely built by the Exora backend.</p>
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

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500"/> Quotation</CardTitle>
            <CardDescription>Generates a formal price quotation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateQuotationMut.mutate()} disabled={generateQuotationMut.isPending} className="w-full">
              {generateQuotationMut.isPending ? "Generating..." : "Generate Quotation"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-500"/> Proforma Invoice</CardTitle>
            <CardDescription>Generates a proforma invoice for buyers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateProformaMut.mutate()} disabled={generateProformaMut.isPending} className="w-full">
              {generateProformaMut.isPending ? "Generating..." : "Generate Proforma Invoice"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-green-500"/> Cost Breakdown Report</CardTitle>
            <CardDescription>Detailed export cost breakdown analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateCostBreakdownMut.mutate()} disabled={generateCostBreakdownMut.isPending} className="w-full" variant="secondary">
              {generateCostBreakdownMut.isPending ? "Generating..." : "Generate Cost Breakdown"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500"/> Export Feasibility Report</CardTitle>
            <CardDescription>Comprehensive risk and feasibility report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => generateFeasibilityMut.mutate()} disabled={generateFeasibilityMut.isPending} className="w-full" variant="secondary">
              {generateFeasibilityMut.isPending ? "Generating..." : "Generate Feasibility Report"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
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
                  <TableHead className="text-right">Action</TableHead>
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
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.documentId)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
