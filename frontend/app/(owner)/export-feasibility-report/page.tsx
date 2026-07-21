"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiClient } from "../../../lib/api/client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { ExportCaseListItem } from "../../../lib/types/export-case";
import { PdfPreviewModal } from "../../../components/ui/pdf-preview-modal";
import { auth } from "../../../lib/firebase/client";

export default function ExportFeasibilityReportPage() {
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
    queryKey: ["owner-export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ["owner-case-advisor", selectedCaseId],
    queryFn: () => apiAdvisor.getRecommendation(selectedCaseId),
    enabled: !!selectedCaseId,
    retry: false,
  });

  const cases: ExportCaseListItem[] = casesData?.data?.items || [];
  const selectedCase = cases.find((c) => c.caseId === selectedCaseId);
  const recommendation = advisorData?.data?.recommendation;

  const feasPct = selectedCase?.feasibilityScore != null ? selectedCase.feasibilityScore * 10 : null;
  const feasLabel = feasPct == null ? null : feasPct >= 80 ? "High" : feasPct >= 60 ? "Moderate" : "Low";
  const feasColor =
    feasPct == null ? "text-gray-400"
    : feasPct >= 80 ? "text-emerald-700"
    : feasPct >= 60 ? "text-amber-700"
    : "text-rose-700";

  const handleGenerate = async () => {
    if (!selectedCaseId) {
      toast.error("Please select an export case first.");
      return;
    }
    setIsGenerating(true);
    setReportResult(null);
    try {
      const res = await apiClient<any>(`/export-cases/${selectedCaseId}/documents/feasibility-report`, {
        method: "POST",
      });
      if (res?.success) {
        const doc = res.data;
        setReportResult({ documentId: doc?.documentId, filename: doc?.filename, generatedAt: new Date().toISOString() });
        toast.success("Export Feasibility Report generated!");
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
            <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 text-[#00A651]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Export Feasibility Report</h2>
        </div>
        <p className="text-sm text-[#6B7280] font-medium">
          Select one export case and generate a PDF report containing metrics, risk scores, feasibility assessment, and AI recommendations. (FR-022)
        </p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800 font-semibold">
        <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <span>Reports are generated per-case. Company-wide combined reports are out of scope (Section 3.2). Download happens immediately — no history is stored.</span>
      </div>

      {/* Case Selector */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6 space-y-5">
        <h3 className="text-base font-extrabold text-[#1F2937]">1 · Select Export Case</h3>
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
                {c.name} · {c.destinationCountry} · {c.status.replace("_", " ")}
              </option>
            ))}
          </select>
          <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Selected case snapshot */}
        {selectedCase && (
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Destination", value: selectedCase.destinationCountry },
              { label: "Status", value: selectedCase.status.replace("_", " ") },
              { label: "Feasibility", value: feasLabel ? `${feasLabel} (${feasPct?.toFixed(0)}/100)` : "Not scored", color: feasColor },
            ].map((item, i) => (
              <div key={i} className="bg-[#F9FAFB] rounded-xl border border-[#E8E3D9] p-3">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">{item.label}</p>
                <p className={`text-sm font-black ${item.color || "text-[#1F2937]"}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendation Preview */}
      {selectedCaseId && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6 space-y-4">
          <h3 className="text-base font-extrabold text-[#1F2937]">2 · AI Recommendation Preview</h3>
          {advisorLoading ? (
            <div className="flex items-center gap-2 text-sm text-[#9CA3AF] font-bold py-4">
              <Icon icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 animate-spin" /> Loading recommendation...
            </div>
          ) : recommendation ? (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Confidence: {recommendation.confidence}
                </span>
                <span className="ml-auto text-[10px] text-[#9CA3AF] font-medium">
                  {new Date(recommendation.generatedAt).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-indigo-950 font-semibold leading-relaxed line-clamp-4">
                {recommendation.answer}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold">
              <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4 shrink-0" />
              No AI recommendation found for this case. The report will be generated without AI content.
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl transition-all hover:shadow-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#1F2937]">3 · Generate & Download PDF</h3>
          <p className="text-xs text-[#9CA3AF] font-medium mt-0.5">
            Includes: metrics, risk scores, feasibility, AI recommendations — scoped to the selected case only.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!selectedCaseId || isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00A651] hover:bg-[#008F44] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-[#00A651]/25 hover:shadow-xl hover:shadow-[#00A651]/30 hover:-translate-y-0.5"
        >
          {isGenerating ? (
            <><Icon icon="solar:refresh-circle-bold-duotone" className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Icon icon="solar:download-minimalistic-bold-duotone" className="w-4 h-4" /> Generate Report</>
          )}
        </button>
      </div>

      {/* Result Banner */}
      {reportResult && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl">
          <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-900">Report generated successfully!</p>
            {reportResult.generatedAt && (
              <p className="text-xs text-emerald-700 font-medium">
                {new Date(reportResult.generatedAt).toLocaleString("id-ID")}
              </p>
            )}
          </div>
          {reportResult.documentId && reportResult.filename && (
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewModal({ open: true, documentId: reportResult.documentId!, filename: reportResult.filename! })}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Icon icon="solar:eye-bold-duotone" className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => handleBlobDownload(reportResult.documentId!, reportResult.filename!)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
              >
                <Icon icon="solar:download-minimalistic-bold-duotone" className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
