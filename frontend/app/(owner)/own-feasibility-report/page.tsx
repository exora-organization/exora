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
import { EmptyState } from "../../../components/ui/EmptyState";
import { auth } from "../../../lib/firebase/client";
import ReactMarkdown from "react-markdown";
import { HeaderNotificationCenter } from "../../../components/navigation/HeaderNotificationCenter";

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-lg font-extrabold text-[#1F2937] border-b border-emerald-200/60 pb-2 mb-4 flex items-center gap-2 tracking-tight">
      <Icon icon="solar:stars-minimalistic-bold-duotone" className="w-5 h-5 text-amber-500 shrink-0" />
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-extrabold text-[#1F2937] border-b border-emerald-100 pb-2 mt-5 mb-2.5 flex items-center gap-2">
      <Icon icon="solar:shield-check-bold-duotone" className="w-4 h-4 text-[#00A651] shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xs font-black uppercase tracking-wider text-[#00A651] mt-5 mb-2 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#00A651]" />
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-xs text-[#374151] leading-relaxed my-2 font-medium">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-2 my-3 pl-1">
      {children}
    </ul>
  ),
  li: ({ children }: any) => (
    <li className="text-xs text-[#374151] font-semibold flex items-start gap-2.5 bg-white/80 p-2.5 rounded-xl border border-emerald-100/60">
      <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4 text-[#00A651] shrink-0 mt-0.5" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: any) => {
    const str = String(children);
    if (str === "Proceed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600" /> Proceed
        </span>
      );
    }
    if (str === "Review Required" || str === "Proceed with Caution") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 text-amber-600" /> {str}
        </span>
      );
    }
    if (str === "Not Recommended") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-100 border border-rose-300 text-rose-900 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-rose-600" /> Not Recommended
        </span>
      );
    }
    return <strong className="font-extrabold text-[#1F2937]">{children}</strong>;
  },
  hr: () => <hr className="my-5 border-emerald-100" />,
  em: ({ children }: any) => (
    <em className="block p-3.5 bg-white/70 border border-emerald-200/60 rounded-2xl text-xs text-emerald-900 font-medium not-italic mt-5">
      <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 inline mr-2 text-[#00A651] align-text-bottom" />
      {children}
    </em>
  ),
};

export default function ExportFeasibilityReportPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<{ documentId?: string; filename?: string; generatedAt?: string } | null>(null);
  const [previewModal, setPreviewModal] = useState<{ open: boolean; documentId: string; filename: string }>({ open: false, documentId: "", filename: "" });



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
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF8F2] flex items-center justify-center shadow-inner">
              <Icon icon="solar:document-text-bold-duotone" className="w-6 h-6 text-[#00A651]" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">
                Export Feasibility Report
              </h2>
              <p className="text-sm text-[#4B5563] font-medium mt-1">
                Select one export case and generate a PDF report containing metrics, risk scores, feasibility assessment, and AI recommendations.
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <HeaderNotificationCenter />
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-4 p-5 bg-blue-50/80 backdrop-blur-md border border-blue-200 rounded-3xl text-sm text-blue-900 font-semibold shadow-sm">
          <Icon icon="solar:shield-check-bold-duotone" className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">Reports are generated per-case. Download happens immediately — no history is stored.</span>
        </div>

        {/* Case Selector */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all">
          <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00A651] text-white text-xs font-black shadow-md">1</span>
            Select Target Export Case
          </h3>
          {cases.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon="solar:document-text-bold-duotone"
                title="No Export Cases Available"
                description="Your company has no export case data yet to generate an Executive Feasibility Report PDF."
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
                    {c.name} · {c.destinationCountry} · {c.status.replace("_", " ")}
                  </option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00A651] pointer-events-none" />
            </div>
          )}
          
          {/* Selected case snapshot */}
          {selectedCase && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 mt-6 border-t border-[#E5E7EB]">
              {[
                { label: "Destination", value: selectedCase.destinationCountry },
                { label: "Status", value: selectedCase.status.replace("_", " ") },
                { label: "Feasibility", value: feasLabel ? `${feasLabel} (${feasPct?.toFixed(0)}/100)` : "Not scored", color: feasColor },
              ].map((item, i) => (
                <div key={i} className="bg-[#F9FAFB] rounded-2xl border border-[#E8E3D9] p-4 shadow-sm">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">{item.label}</p>
                  <p className={`text-base font-black ${item.color || "text-[#1F2937]"} capitalize`}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendation Preview */}
        {selectedCaseId && (
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00A651] text-white text-xs font-black shadow-md">2</span>
              AI Recommendation Preview
            </h3>
            {advisorLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-full shadow-md flex items-center gap-3 text-[#00A651] font-bold text-sm">
                  <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-5 h-5 animate-spin" /> Fetching AI insight...
                </div>
              </div>
            ) : recommendation ? (
              <div className="p-6 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                      Confidence: {recommendation.confidence}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest block">
                      {new Date(recommendation.generatedAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="p-5 md:p-6 bg-white/80 rounded-2xl border border-emerald-100/80 shadow-xs">
                  <ReactMarkdown components={markdownComponents}>
                    {recommendation.answer}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-semibold shadow-sm">
                <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 shrink-0 mt-0.5 text-amber-500" />
                <span className="leading-relaxed">No AI recommendation found for this case. The report will be generated without AI content. Query the advisor on the case details page to fetch trade insights.</span>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all">
          <div>
            <h3 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#00A651] text-white text-xs font-black shadow-md">3</span>
              Generate & Download PDF
            </h3>
            <p className="text-xs text-[#9CA3AF] font-bold mt-2 ml-10 uppercase tracking-widest leading-relaxed">
              Includes metrics, risk scores, feasibility & AI recommendations.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedCaseId || isGenerating}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#00A651] hover:bg-[#008F44] disabled:bg-gray-400 disabled:shadow-none text-white font-bold text-sm shadow-lg shadow-[#00A651]/30 transition-all w-full sm:w-auto shrink-0"
          >
            {isGenerating ? (
              <><Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-5 h-5 animate-spin" /> Generating...</>
            ) : (
              <><Icon icon="solar:download-minimalistic-bold-duotone" className="w-5 h-5" /> Generate Report</>
            )}
          </button>
        </div>

        {/* Result Banner */}
        {reportResult && (
          <div className="flex items-center gap-4 p-6 bg-emerald-50/90 backdrop-blur-md border border-emerald-300 rounded-3xl shadow-lg animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
              <Icon icon="solar:check-circle-bold-duotone" className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-extrabold text-emerald-950">Report generated successfully!</p>
              {reportResult.generatedAt && (
                <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest mt-1">
                  {new Date(reportResult.generatedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
            {reportResult.documentId && reportResult.filename && (
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewModal({ open: true, documentId: reportResult.documentId!, filename: reportResult.filename! })}
                  className="px-6 py-2.5 rounded-full bg-[#00A651] text-white text-sm font-bold hover:bg-[#008F44] shadow-md shadow-[#00A651]/20 transition-all flex items-center gap-2"
                >
                  <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" /> Preview & Save PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
