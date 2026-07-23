"use client";

import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiClient } from "../../../lib/api/client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ExportCaseListItem } from "../../../lib/types/export-case";
import { PdfPreviewModal } from "../../../components/ui/pdf-preview-modal";
import { EmptyState } from "../../../components/ui/EmptyState";
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
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center shadow-inner">
              <Icon icon="solar:document-text-bold-duotone" className="w-6 h-6 text-[#00A651]" />
            </div>
            Cost Breakdown Documents
          </h2>
          <p className="text-sm text-[#4B5563] font-medium mt-3">
            Generate cumulative Incoterm cost breakdowns (EXW, FOB, CFR, CIF) into standard PDF reports.
          </p>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-4 p-5 bg-blue-50/80 backdrop-blur-md border border-blue-200 rounded-3xl text-sm text-blue-900 font-semibold shadow-sm">
          <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">Reports are generated instantly per selected case. Cost details are compiled automatically from configuration sheets. Download happens immediately without history storage.</span>
        </div>

        {/* Case Selector */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00A651] text-white text-xs font-black shadow-md">1</span>
            Select Target Export Case
          </h3>
          {cases.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon="solar:calculator-bold-duotone"
                title="No Export Cases Available"
                description="No export case data exists yet to generate Cost Breakdown Report PDFs."
              />
            </div>
          ) : (
            <div className="relative max-w-xl">
              <select
                className="w-full appearance-none bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-5 py-4 pr-12 text-sm font-bold outline-none text-[#1F2937] disabled:opacity-60 cursor-pointer focus:ring-2 focus:ring-[#00A651]/20 transition-all shadow-sm"
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
              <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651] pointer-events-none" />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all">
          <div>
            <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00A651] text-white text-xs font-black shadow-md">2</span>
              Export PDF Report
            </h3>
            <p className="text-xs text-[#9CA3AF] font-bold mt-2 ml-10 uppercase tracking-widest">
              Generates standard Cost Breakdown analysis.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedCaseId || isGenerating}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#00A651] hover:bg-[#008F44] disabled:bg-gray-400 disabled:shadow-none text-white font-bold text-sm shadow-lg shadow-[#00A651]/30 transition-all w-full sm:w-auto"
          >
            {isGenerating ? (
              <><Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Icon icon="solar:download-square-bold-duotone" className="w-5 h-5" /> Download Report</>
            )}
          </button>
        </div>

        {/* Result Alert */}
        {reportResult && (
          <div className="flex items-center gap-4 p-6 bg-emerald-50/90 backdrop-blur-md border border-emerald-300 rounded-3xl shadow-lg animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
              <Icon icon="solar:check-circle-bold-duotone" className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-extrabold text-emerald-950">PDF Document successfully compiled!</p>
              {reportResult.generatedAt && (
                <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest mt-1">
                  {new Date(reportResult.generatedAt).toLocaleString()}
                </p>
              )}
            </div>
            {reportResult.documentId && reportResult.filename && (
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewModal({ open: true, documentId: reportResult.documentId!, filename: reportResult.filename! })}
                  className="px-6 py-2.5 rounded-full bg-white border border-gray-200 text-[#1F2937] text-sm font-bold hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
                >
                  <Icon icon="solar:eye-bold-duotone" className="w-4 h-4 text-blue-600" /> Preview
                </button>
                <button
                  onClick={() => handleBlobDownload(reportResult.documentId!, reportResult.filename!)}
                  className="px-6 py-2.5 rounded-full bg-[#00A651] text-white text-sm font-bold hover:bg-[#008F44] shadow-md shadow-[#00A651]/20 transition-all flex items-center gap-2"
                >
                  <Icon icon="solar:download-square-bold-duotone" className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
