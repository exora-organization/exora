"use client";

import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiClient } from "../../../lib/api/client";
import { useState } from "react";
import { 
  FileText, Download, ChevronDown, Loader2, 
  AlertTriangle, CheckCircle, ShieldCheck, Eye
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { PdfPreviewModal } from "../../../components/ui/pdf-preview-modal";
import { auth } from "../../../lib/firebase/client";

export default function FinanceDocumentsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<{ documentId?: string; filename?: string; generatedAt?: string } | null>(null);
  const [previewModal, setPreviewModal] = useState<{ open: boolean; documentId: string; filename: string }>({ open: false, documentId: "", filename: "" });

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

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const cases = casesData?.data?.items || [];
  const selectedCase = cases.find(c => c.caseId === selectedCaseId);

  const handleGenerate = async () => {
    if (!selectedCaseId) {
      toast.error("Please select an export case first.");
      return;
    }
    setIsGenerating(true);
    setReportResult(null);
    try {
      const res = await apiClient<any>(`/export-cases/${selectedCaseId}/documents/cost-breakdown-report`, {
        method: "POST",
      });
      if (res?.success) {
        const doc = res.data;
        setReportResult({ documentId: doc?.documentId, filename: doc?.filename, generatedAt: new Date().toISOString() });
        toast.success("Cost Breakdown Report generated!");
        if (doc?.documentId && doc?.filename) {
          setTimeout(() => setPreviewModal({ open: true, documentId: doc.documentId, filename: doc.filename }), 300);
        }
      } else {
        toast.error("Failed to generate report.");
      }
    } catch (err: any) {
      toast.error(err.message || "Report generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PdfPreviewModal
        open={previewModal.open}
        onClose={() => setPreviewModal((s) => ({ ...s, open: false }))}
        documentId={previewModal.documentId}
        filename={previewModal.filename}
      />
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#EBF8F2] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#00A651]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Cost Breakdown Documents</h2>
        </div>
        <p className="text-sm text-[#4B5563] font-medium">
          Generate cumulative Incoterm cost breakdowns (EXW, FOB, CFR, CIF) into standard PDF reports (FR-012, FR-023).
        </p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <span>Reports are generated instantly per selected case. Cost details are compiled automatically from configuration sheets. Download happens immediately without history storage.</span>
      </div>

      {/* Case Selector */}
      <Card className="border-[#E8E3D9] shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-extrabold">1 · Select Target Export Case</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <select
              className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 pr-10 text-sm font-semibold outline-none text-[#1F2937] disabled:opacity-60 cursor-pointer"
              value={selectedCaseId}
              onChange={(e) => { setSelectedCaseId(e.target.value); setReportResult(null); }}
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

      {/* Action Button */}
      <div className="bg-white rounded-2xl border border-[#E8E3D9] shadow-md p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#1F2937]">2 · Export PDF Report</h3>
          <p className="text-xs text-[#9CA3AF] font-bold mt-0.5">
            Generates standard Cost Breakdown analysis.
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!selectedCaseId || isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-sm transition-all"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Download className="w-4 h-4" /> Download Report</>
          )}
        </Button>
      </div>

      {/* Result Alert */}
      {reportResult && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-900">PDF Document successfully compiled!</p>
            {reportResult.generatedAt && (
              <p className="text-xs text-emerald-700 font-bold">
                {new Date(reportResult.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          {reportResult.documentId && reportResult.filename && (
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewModal({ open: true, documentId: reportResult.documentId!, filename: reportResult.filename! })}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => handleBlobDownload(reportResult.documentId!, reportResult.filename!)}
                className="px-4 py-2 rounded-xl bg-[#00A651] text-white text-xs font-bold hover:bg-[#008F44] transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
