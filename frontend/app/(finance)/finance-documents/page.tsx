"use client";

import { useQuery } from "@tanstack/react-query";
import { apiExportCase } from "../../../lib/api/export-case";
import { apiClient } from "../../../lib/api/client";
import { useState } from "react";
import { 
  FileText, Download, ChevronDown, Loader2, 
  AlertTriangle, CheckCircle, ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function FinanceDocumentsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<{ url?: string; generatedAt?: string } | null>(null);

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
        setReportResult({ url: res.data?.documentUrl, generatedAt: new Date().toISOString() });
        toast.success("Cost Breakdown Report generated!");
        if (res.data?.documentUrl) {
          window.open(res.data.documentUrl, "_blank");
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
          {reportResult.url && (
            <a 
              href={reportResult.url} 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#00A651] text-white text-xs font-bold hover:bg-[#008F44] transition-colors"
            >
              Open File
            </a>
          )}
        </div>
      )}
    </div>
  );
}
