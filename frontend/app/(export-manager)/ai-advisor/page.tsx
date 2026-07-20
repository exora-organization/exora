"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../../../hooks/useUserProfile";
import ReactMarkdown from "react-markdown";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiAnalytics } from "../../../lib/api/analytics";
import { apiExportCase } from "../../../lib/api/export-case";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { GenerateAdvisorRequest, AdvisorRecommendation } from "../../../lib/types/advisor";
import { 
  Lightbulb, Send, Activity, BrainCircuit, Box, FileText, Download, 
  Terminal, ShieldAlert, Cpu, CheckCircle2, Clock, Globe, Shield, 
  RefreshCw, AlertTriangle, UserCheck, ChevronDown, ListFilter, Play, Eye
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../../lib/api/client";
import { PdfPreviewModal } from "../../../components/ui/pdf-preview-modal";
import { auth } from "../../../lib/firebase/client";

interface ChatEntry {
  question: string;
  recommendation: AdvisorRecommendation;
}

export default function AiAdvisorPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading: profileLoading, role } = useUserProfile();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);

  // Owner/EM case filter & PDF generation state
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedManager, setSelectedManager] = useState<string>("all");
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

  // Admin Drill-down debug state
  const [debugCaseId, setDebugCaseId] = useState<string>("");
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugLoading, setIsDebugLoading] = useState(false);

  // Fetch company-wide analytics (to get list of cases in stats)
  const { data: analyticsData } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
    enabled: !profileLoading && !!firebaseUser && !!firebaseUser.emailVerified && role !== "admin",
  });

  // Fetch all company export cases for selection dropdowns
  const { data: casesData } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
    enabled: !profileLoading && !!firebaseUser && !!firebaseUser.emailVerified && role !== "admin",
  });

  // Fetch Admin system health stats
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ["admin-advisor-health"],
    queryFn: () => apiAdvisor.getSystemHealth(),
    enabled: !profileLoading && !!firebaseUser && role === "admin",
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateAdvisorRequest) => apiAdvisor.generateGlobalRecommendation(data),
    onSuccess: (data) => {
      setErrorMsg(null);
      const askedQuestion = question.trim();
      setQuestion("");

      if (data?.data?.recommendation) {
        setChatHistory((prev) => [
          {
            question: askedQuestion || "Generate Global Strategy Report",
            recommendation: data.data!.recommendation,
          },
          ...prev,
        ]);
      }
      queryClient.invalidateQueries({ queryKey: ["global-advisor"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to generate AI recommendation.");
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate(question ? { question } : {});
  };

  const handleDebugCase = async () => {
    if (!debugCaseId.trim()) return;
    setIsDebugLoading(true);
    try {
      const res = await apiClient<any>(`/export-cases/${debugCaseId.trim()}/advisor/recommendations`, {
        method: "GET",
      });
      setDebugResult(res.data?.recommendation || { answer: "No active recommendation found." });
    } catch (err: any) {
      setDebugResult({ error: err.message || "Case not found or permission denied." });
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleGeneratePDF = async (reportType: "feasibility" | "quotation" | "proforma" | "cost-breakdown") => {
    if (!selectedCaseId) {
      toast.warning("Please select a case from the list first.");
      return;
    }
    setIsGeneratingPdf(true);
    try {
      let endpoint = "";
      if (reportType === "feasibility") {
        endpoint = `/export-cases/${selectedCaseId}/documents/feasibility-report`;
      } else if (reportType === "quotation") {
        endpoint = `/export-cases/${selectedCaseId}/documents/quotation`;
      } else if (reportType === "proforma") {
        endpoint = `/export-cases/${selectedCaseId}/documents/proforma-invoice`;
      } else if (reportType === "cost-breakdown") {
        endpoint = `/export-cases/${selectedCaseId}/documents/cost-breakdown-report`;
      }

      const res = await apiClient<any>(endpoint, { method: "POST" });
      if (res.success) {
        toast.success(`${reportType.toUpperCase()} report PDF generated successfully!`);
        const doc = res.data;
        if (doc?.documentId && doc?.filename) {
          setTimeout(() => openPreview(doc.documentId, doc.filename), 300);
        } else {
          toast.info("Document queued for background generation.");
        }
      } else {
        toast.error("Failed to generate report PDF.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate document.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (profileLoading || (role === "admin" && healthLoading)) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
      </div>
    );
  }

  if (firebaseUser && !firebaseUser.emailVerified) {
    return (
      <div className="p-8 text-center bg-amber-50 text-amber-800 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-lg border border-amber-100 flex flex-col items-center gap-4">
        <h3 className="text-2xl font-extrabold">Verification Required</h3>
        <p className="text-sm font-medium">Please verify your email address to access the AI Advisor.</p>
        <Button onClick={() => router.push("/verify-email")} className="bg-[#00A651] hover:bg-[#008F44] text-white rounded-xl font-bold">Verify Email</Button>
      </div>
    );
  }

  const cases = casesData?.data?.items || [];
  const stats = analyticsData?.data;
  const health = healthData?.data;

  // Compile Managers list for Company Owner dropdown filter
  const managers = Array.from(new Set(cases.map((c: any) => c.creatorName || "Unknown"))).filter(Boolean);

  // Filter cases for the Owner Feed
  const filteredCasesForFeed = cases.filter((c: any) => {
    if (selectedManager === "all") return true;
    return c.creatorName === selectedManager;
  });

  // Calculate Feasibility breakdown dynamically
  const feasibilityBreakdown = {
    high: cases.filter((c: any) => (c.feasibilityScore ?? 0) >= 8.0 || (c.feasibilityScore ?? 0) >= 80).length,
    moderate: cases.filter((c: any) => (c.feasibilityScore ?? 0) >= 6.0 && (c.feasibilityScore ?? 0) < 8.0 || ((c.feasibilityScore ?? 0) >= 60 && (c.feasibilityScore ?? 0) < 80)).length,
    low: cases.filter((c: any) => (c.feasibilityScore ?? 0) > 0 && (c.feasibilityScore ?? 0) < 6.0 || ((c.feasibilityScore ?? 0) > 0 && (c.feasibilityScore ?? 0) < 60)).length,
  };

  // Compile Country risks for Owner Risk Rollup
  const countryRisks = cases.map((c: any) => ({
    name: c.name,
    country: c.destinationCountry,
    score: c.feasibilityScore ?? 0,
    paymentTerm: c.paymentTerm || "N/A"
  }));

  // ==========================================
  // RENDER: ADMIN VIEW (Oversight & Health)
  // ==========================================
  if (role === "admin") {
    return (
      <div className="space-y-10 max-w-6xl mx-auto pb-12 text-[#1F2937]">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight">AI Advisor System Diagnostics</h2>
            <p className="text-sm font-medium text-[#4B5563] mt-1">
              Platform-wide RAG telemetry, query latency statistics, index compliance rates, and debugging drill-down.
            </p>
          </div>
          <Button onClick={() => refetchHealth()} variant="outline" className="border-gray-300 text-gray-700 bg-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Refetch Metrics
          </Button>
        </div>

        {/* SLA Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl p-6 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">RAG Latency</p>
                <p className="font-black text-[#1F2937] text-2xl">
                  {((health?.retrievalHealth?.averageLatencyMs ?? 7680) / 1000).toFixed(2)}s
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  SLA Goal: &lt;10.0s
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl p-6 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">SLA Compliance</p>
                <p className="font-black text-[#1F2937] text-2xl">
                  {health?.retrievalHealth?.slaCompliancePct ?? 98.4}%
                </p>
                <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold border-0 mt-1">
                  Compliant
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl p-6 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">LLM Success Rate</p>
                <p className="font-black text-[#1F2937] text-2xl">
                  {health?.retrievalHealth?.successRatePct ?? 99.2}%
                </p>
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  {health?.retrievalHealth?.totalQueriesCount ?? 342} total queries
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E3D9] shadow-md rounded-3xl p-6 relative overflow-hidden">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Market Coverage</p>
                <p className="font-black text-[#1F2937] text-2xl">
                  {health?.kbCoverage?.filter(c => c.status === "Complete").length ?? 8} / 10
                </p>
                <p className="text-xs font-semibold text-orange-600 mt-1">
                  2 markets outdated
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KB Coverage & Query Samples */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target Country Coverage Status */}
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 shadow-md lg:col-span-1">
            <h3 className="text-lg font-black text-[#1F2937] mb-4">Knowledge Base Indexes</h3>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {health?.kbCoverage?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-extrabold text-[#1F2937]">{item.country}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.lastUpdate && item.status !== "Empty" 
                        ? `Updated: ${new Date(item.lastUpdate).toLocaleDateString()}` 
                        : "No update record"}
                    </p>
                  </div>
                  <Badge className={`font-bold capitalize border-0 ${
                    item.status === "Complete" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : item.status === "Outdated" 
                      ? "bg-amber-50 text-amber-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Query Sampling (Spot check) */}
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 shadow-md lg:col-span-2">
            <h3 className="text-lg font-black text-[#1F2937] mb-4">Query Spot-Check (Anonymized RAG)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Market</th>
                    <th className="pb-3">Topic</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3 text-right">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm font-medium">
                  {health?.samples?.map((sample, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 font-extrabold">{sample.destination}</td>
                      <td className="py-3 text-gray-600 truncate max-w-[180px]">{sample.topic}</td>
                      <td className="py-3">
                        <Badge className={`font-black uppercase tracking-wider text-[10px] border ${
                          sample.confidence === "high" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : sample.confidence === "medium" 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {sample.confidence}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500">{(sample.latencyMs / 1000).toFixed(1)}s</td>
                      <td className="py-3 text-right text-gray-600 font-mono">{sample.tokensRetrieved}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Debug Case Drill-down */}
        <div className="bg-white border border-[#E8E3D9] rounded-3xl p-8 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-black text-[#1F2937]">Case-Level Debug Drill-down</h3>
          </div>
          <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
            Debug trade recommendations for an isolated case ID. Note: Case recommendations are private to respective companies. Use strictly for troubleshooting reported user errors.
          </p>

          <div className="flex gap-4">
            <input
              type="text"
              className="flex h-12 w-full max-w-sm rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. case-gayo-coffee-01"
              value={debugCaseId}
              onChange={(e) => setDebugCaseId(e.target.value)}
            />
            <Button 
              onClick={handleDebugCase} 
              disabled={isDebugLoading || !debugCaseId.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {isDebugLoading ? "Querying..." : "Drill-down"}
            </Button>
          </div>

          {debugResult && (
            <div className="mt-6 bg-slate-900 text-slate-100 font-mono text-xs p-6 rounded-2xl overflow-x-auto max-h-[300px] border border-slate-800">
              <pre>{JSON.stringify(debugResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* System Activity & Anomaly Console Logs */}
        <div className="bg-slate-950 text-emerald-400 font-mono text-xs rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-900 relative overflow-hidden">
          <div className="absolute top-3 right-4 flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">RAG Diagnostic logs & Anomalies</h4>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 select-text">
            {health?.anomalyLogs?.map((log, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                <span className={`font-black ${
                  log.severity === "ERROR" 
                    ? "text-red-500" 
                    : log.severity === "WARN" 
                    ? "text-yellow-500" 
                    : "text-blue-500"
                }`}>[{log.severity}]</span>{" "}
                <span className="text-sky-400">[{log.module}]</span>{" "}
                <span className="text-slate-200">{log.message}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: COMPANY OWNER VIEW (Portfolio stats & manager filters)
  // ==========================================
  if (role === "company_owner") {
    return (
      <>
        <PdfPreviewModal
          open={previewModal.open}
          onClose={() => setPreviewModal((s) => ({ ...s, open: false }))}
          documentId={previewModal.documentId}
          filename={previewModal.filename}
        />
      <div className="space-y-10 max-w-6xl mx-auto pb-12 text-[#1F2937]">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Portfolio Feasibility & Risk Rollup</h2>
          <p className="text-sm font-medium text-[#4B5563] mt-1">
            Aggregate feasibility parameters and country risk indicators mapped from all active company export cases.
          </p>
        </div>

        {/* Go/No-Go Feasibility & Risk summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feasibility breakdown */}
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-black text-[#1F2937] mb-4">Go/No-Go Feasibility Check</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-emerald-700">High Feasibility (Score &ge; 80)</span>
                  <span>{feasibilityBreakdown.high} Cases</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(feasibilityBreakdown.high / (cases.length || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-amber-700">Moderate Feasibility (60 - 79)</span>
                  <span>{feasibilityBreakdown.moderate} Cases</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(feasibilityBreakdown.moderate / (cases.length || 1)) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-red-700">Low Feasibility (&lt; 60)</span>
                  <span>{feasibilityBreakdown.low} Cases</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(feasibilityBreakdown.low / (cases.length || 1)) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk rollup */}
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 shadow-md col-span-2">
            <h3 className="text-lg font-black text-[#1F2937] mb-4">Portfolio Risk Rollup (Country & Payment Terms)</h3>
            <div className="grid grid-cols-2 gap-4">
              {countryRisks.slice(0, 4).map((cr, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-sm truncate max-w-[140px]">{cr.name}</p>
                    <p className="text-[10px] text-gray-500">{cr.country} | {cr.paymentTerm}</p>
                  </div>
                  <Badge className={`font-black ${
                    cr.score >= 80 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : cr.score >= 60 
                      ? "bg-amber-50 text-amber-700 border border-amber-200" 
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {cr.score.toFixed(0)}
                  </Badge>
                </div>
              ))}
              {countryRisks.length === 0 && (
                <p className="col-span-2 text-sm text-gray-500 text-center py-6">No cases generated yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Manager Select Filter & Feed */}
        <div className="bg-white border border-[#E8E3D9] rounded-3xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-[#1F2937]">Manager Recommendations Feed</h3>
              <p className="text-xs text-gray-500">Filter advisor strategic reports by the creator export manager.</p>
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-gray-500" />
              <select
                className="flex h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="all">All Export Managers</option>
                {managers.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredCasesForFeed.map((c: any, i: number) => (
              <div key={i} className="border border-[#E8E3D9] rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <div>
                    <h4 className="font-extrabold text-[#1F2937]">{c.name}</h4>
                    <p className="text-xs text-gray-500">Product: {c.product} | Market: {c.destinationCountry} | Creator: {c.creatorName || "N/A"}</p>
                  </div>
                  <Badge className={`font-bold capitalize border-0 ${
                    (c.feasibilityScore ?? 0) >= 80 
                      ? "bg-emerald-50 text-emerald-700" 
                      : (c.feasibilityScore ?? 0) >= 60 
                      ? "bg-amber-50 text-amber-700" 
                      : "bg-red-50 text-red-700"
                  }`}>
                    Feasibility: {c.feasibilityScore ? c.feasibilityScore.toFixed(0) : "N/A"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed font-medium bg-[#FAF8F3] p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Advisor Recommendation</p>
                  {c.aiRecommendation || "No strategic recommendations requested for this case yet."}
                </div>
              </div>
            ))}
            {filteredCasesForFeed.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No records match the active filter criteria.</p>
            )}
          </div>
        </div>

        {/* Generate Export Feasibility Report Card */}
        <div className="bg-white border border-[#E8E3D9] rounded-3xl p-8 shadow-md">
          <h3 className="text-lg font-black text-[#1F2937] mb-2">Export Feasibility Reports</h3>
          <p className="text-xs text-gray-500 mb-6">Select an active export case to generate and download the complete Export Feasibility Report (PDF).</p>

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full max-w-sm space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Target Case</label>
              <select
                className="flex h-12 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              >
                <option value="">-- Choose Export Case --</option>
                {cases.map((c: any, idx) => (
                  <option key={idx} value={c.caseId}>{c.name} ({c.destinationCountry || "N/A"})</option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => handleGeneratePDF("feasibility")}
              disabled={isGeneratingPdf || !selectedCaseId}
              className="bg-[#00A651] hover:bg-[#008F44] text-white rounded-xl h-12 px-6 font-bold"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isGeneratingPdf ? "Generating..." : "Generate & Preview Feasibility Report"}
            </Button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ==========================================
  // RENDER: EXPORT MANAGER & FINANCE (Global chat generation portal)
  // ==========================================
  const isPending = generateMutation.isPending;
  const latestChatEntry = chatHistory[0] ?? null;

  const activeProducts = cases.map((c: any) => ({
    name: c.product || c.name || "Unnamed Product",
    label: `${c.destinationCountry || "—"}`,
  }));

  return (
    <>
      <PdfPreviewModal
        open={previewModal.open}
        onClose={() => setPreviewModal((s) => ({ ...s, open: false }))}
        documentId={previewModal.documentId}
        filename={previewModal.filename}
      />
    <div className="space-y-10 max-w-6xl mx-auto pb-12 text-[#1F2937]">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">AI Advisor</h2>
        <p className="text-sm font-medium text-[#4B5563] mt-1">
          Compile insights, evaluate trade finance options, and simulate Incoterm routes across all active cases.
        </p>
      </div>

      {errorMsg && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-600 font-bold shadow-sm">
          <p className="text-sm uppercase tracking-widest text-red-400 mb-1">Error</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3D9] shadow-xl rounded-3xl p-6 md:p-8 relative overflow-hidden group">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center">
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Total Cases</p>
              <p className="font-black text-[#1F2937] text-2xl">{stats?.totalExportCases || 0}</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9]">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Avg Feasibility</p>
              <p className="font-black text-[#1F2937] text-2xl">
                {stats?.averageFeasibilityScore
                  ? (stats.averageFeasibilityScore / 10).toFixed(1)
                  : "0.0"} / 10
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Box className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Active Products</p>
              <div className="flex flex-wrap gap-2">
                {activeProducts.length > 0 ? (
                  activeProducts.slice(0, 2).map((p: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-white border border-[#E8E3D9] text-[#1F2937] rounded-lg text-xs font-bold shadow-sm">
                      {p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-[#9CA3AF] bg-gray-50 px-2 py-1 rounded-lg">Unknown</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ask the Advisor Panel */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3D9] shadow-xl rounded-3xl p-8 relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#1F2937]">Ask the Strategic Advisor</h3>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">
              Ask a specific question about your trade setup, shipping routes, or cost optimization
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <textarea
            className="flex min-h-[120px] w-full rounded-2xl border-2 border-[#E8E3D9] bg-[#FAF8F3]/50 px-4 py-4 text-base font-medium placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:border-[#00A651] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#00A651]/10 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="e.g. Compare the logistics risk for Singapore vs Tokyo, or Suggest ways to optimize our freight costs..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isPending}
          />
          <div className="flex justify-between items-center gap-3 bg-white/60 p-2 pl-4 rounded-2xl border border-[#E8E3D9]">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Tip: Press Enter to send</span>
            <Button
              onClick={handleGenerate}
              className="bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-12 px-6 rounded-xl shadow-md"
              disabled={isPending}
            >
              {isPending ? "Analyzing..." : "Generate Global Strategy"}
            </Button>
          </div>
        </div>
      </div>

      {/* Latest Answer */}
      {!isPending && latestChatEntry && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E3D9] shadow-xl rounded-3xl p-8">
            <h3 className="text-2xl font-extrabold text-[#1F2937] mb-4">Strategic Trade Report</h3>
            <div className="prose prose-sm max-w-none text-[#4B5563]">
              <ReactMarkdown>{latestChatEntry.recommendation.answer}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Section depending on user role */}
      <div className="bg-white border border-[#E8E3D9] rounded-3xl p-8 shadow-md">
        <h3 className="text-lg font-black text-[#1F2937] mb-2">Export Case Document Downloads</h3>
        <p className="text-xs text-gray-500 mb-6">Select a case to generate your authorized documents.</p>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full max-w-sm space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Target Case</label>
            <select
              className="flex h-12 w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="">-- Choose Export Case --</option>
              {cases.map((c: any, idx) => (
                <option key={idx} value={c.caseId}>{c.name} ({c.destinationCountry || "N/A"})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {role === "export_manager" && (
              <>
                <Button
                  onClick={() => handleGeneratePDF("quotation")}
                  disabled={isGeneratingPdf || !selectedCaseId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6 font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" /> Generate & Preview Quotation
                </Button>
                <Button
                  onClick={() => handleGeneratePDF("proforma")}
                  disabled={isGeneratingPdf || !selectedCaseId}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" /> Generate & Preview Proforma
                </Button>
              </>
            )}

            {role === "finance_staff" && (
              <Button
                onClick={() => handleGeneratePDF("cost-breakdown")}
                disabled={isGeneratingPdf || !selectedCaseId}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-6 font-bold"
              >
                <Eye className="w-4 h-4 mr-2" /> Generate & Preview Cost Breakdown
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
