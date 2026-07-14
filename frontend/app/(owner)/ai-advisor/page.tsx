"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiAnalytics } from "../../../lib/api/analytics";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { GenerateAdvisorRequest, AdvisorRecommendation } from "../../../lib/types/advisor";
import { Lightbulb, Send, Activity, BrainCircuit, Box, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface ChatEntry {
  question: string;
  recommendation: AdvisorRecommendation;
}

export default function AiAdvisorPage() {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);

  // Fetch company-wide analytics (to get list of cases in stats)
  const { data: analyticsData } = useQuery({
    queryKey: ["owner-analytics"],
    queryFn: () => apiAnalytics.getDashboard(),
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateAdvisorRequest) => apiAdvisor.generateGlobalRecommendation(data),
    onSuccess: (data) => {
      setErrorMsg(null);
      const askedQuestion = question.trim();
      setQuestion("");

      // Immediately add to chat history so the UI updates right away
      if (data?.data?.recommendation) {
        setChatHistory((prev) => [
          {
            question: askedQuestion || "Generate Global Strategy Report",
            recommendation: data.data!.recommendation,
          },
          ...prev,
        ]);
      }

      // Also invalidate so if user revisits, they get latest
      queryClient.invalidateQueries({ queryKey: ["global-advisor"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to generate AI recommendation.");
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate(question ? { question } : {});
  };

  const cases = analyticsData?.data?.recentCases || [];
  const stats = analyticsData?.data;

  const isPending = generateMutation.isPending;

  // The most recent answer to display at the top (from mutation or from query)
  const latestChatEntry = chatHistory[0] ?? null;

  // Build "Active Products" from real case data
  const activeProducts = cases.map((c: any) => ({
    name: c.product || c.name || "Unnamed Product",
    label: `${c.destinationCountry || "—"}`,
  }));

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12 text-[#1F2937]">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight">AI Advisor</h2>
        <p className="text-sm font-medium text-[#4B5563] mt-1">
          Get company-wide strategic insights and trade finance recommendations compiled from all active export cases.
        </p>
      </div>

      {errorMsg && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-600 font-bold shadow-sm">
          <p className="text-sm uppercase tracking-widest text-red-400 mb-1">Error</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center">
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:bg-white hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Total Cases</p>
              <p className="font-black text-[#1F2937] text-2xl">{stats?.totalExportCases || 0}</p>
            </div>
          </div>
          
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:bg-white hover:shadow-md transition-all">
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
          
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:bg-white hover:shadow-md transition-all col-span-2 md:col-span-1">
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
                {activeProducts.length > 2 && (
                  <span className="px-2 py-1 bg-gray-50 border border-[#E8E3D9] text-[#9CA3AF] rounded-lg text-xs font-bold shadow-sm">
                    +{activeProducts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8 mt-8">
        {/* Ask the Advisor Panel */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
          
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isPending) {
                  handleGenerate();
                }
              }}
            />
            <div className="flex justify-between items-center gap-3 bg-white/60 p-2 pl-4 rounded-2xl border border-[#E8E3D9]">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Tip: Press Ctrl+Enter to send</span>
              <Button
                onClick={handleGenerate}
                className="bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-12 px-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Analyzing...
                  </span>
                ) : chatHistory.length > 0 ? (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" /> Ask Advisor
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Generate Global Strategy
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Loader */}
        {isPending && (
          <div className="bg-white/90 backdrop-blur-xl border border-[#00A651]/20 shadow-xl shadow-[#00A651]/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center animate-pulse">
            <div className="flex space-x-3 justify-center items-center mb-6">
              <div className="h-4 w-4 bg-[#00A651] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-4 w-4 bg-[#00A651] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-4 w-4 bg-[#00A651] rounded-full animate-bounce"></div>
            </div>
            <p className="text-xl font-extrabold text-[#1F2937]">Consulting Trade Knowledge Base...</p>
            <p className="text-sm font-bold text-[#9CA3AF] uppercase tracking-widest mt-2 max-w-sm">
              Retrieving import regulations, evaluating payment terms, and matching Incoterm guidelines.
            </p>
          </div>
        )}

        {/* Latest Answer from Chat History */}
        {!isPending && latestChatEntry && (
          <RecommendationCard
            question={latestChatEntry.question}
            recommendation={latestChatEntry.recommendation}
            isLatest={true}
          />
        )}

        {/* Previous answers in collapsible form */}
        {!isPending && chatHistory.length > 1 && (
          <div className="space-y-6 pt-6">
            <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-widest border-b border-[#E8E3D9] pb-2">Previous Answers</h3>
            {chatHistory.slice(1).map((entry, i) => (
              <RecommendationCard
                key={i}
                question={entry.question}
                recommendation={entry.recommendation}
                isLatest={false}
              />
            ))}
          </div>
        )}

        {/* Initial State / Empty Recommendation */}
        {!isPending && chatHistory.length === 0 && (
          <div className="bg-white/40 backdrop-blur-sm border-2 border-dashed border-[#E8E3D9] rounded-3xl p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-[#E8E3D9]">
              <BrainCircuit className="h-10 w-10 text-[#9CA3AF]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#1F2937]">No Global Report Generated Yet</h3>
            <p className="text-sm font-bold text-[#9CA3AF] mt-2 max-w-md uppercase tracking-widest">
              Generate your first strategic report to compile metrics across all active products and shipping portfolios.
            </p>
            <Button onClick={handleGenerate} className="mt-8 bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-14 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" disabled={isPending}>
              <Lightbulb className="w-5 h-5 mr-2" />
              Generate Global Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for displaying a recommendation card
function RecommendationCard({
  question,
  recommendation,
  isLatest,
}: {
  question: string;
  recommendation: AdvisorRecommendation;
  isLatest: boolean;
}) {
  return (
    <div className="space-y-6 mt-10">
      {/* Question bubble */}
      <div className="flex justify-end">
        <div className="bg-[#00A651] text-white text-base font-bold rounded-3xl rounded-tr-sm px-6 py-4 max-w-[85%] shadow-lg shadow-[#00A651]/20">
          {question}
        </div>
      </div>

      {/* Answer card */}
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#E8E3D9] shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">Confidence:</span>
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
              recommendation.confidence === "high"
                ? "bg-green-50 text-green-600 border border-green-200"
                : recommendation.confidence === "medium"
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}>
              {recommendation.confidence}
            </span>
            {isLatest && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">
                Latest
              </span>
            )}
          </div>
          <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest">
            {new Date(recommendation.generatedAt).toLocaleString()}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden group">
          <div className="p-8 border-b border-[#E8E3D9] bg-gradient-to-r from-[#FAF8F3] to-white">
            <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
              <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block"></span>
              Global Strategy & Trade Analysis
            </h3>
          </div>
          <div className="p-8 md:p-10">
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-[#1F2937] prose-headings:font-extrabold prose-a:text-[#00A651] prose-strong:text-[#1F2937] prose-strong:font-black text-[#4B5563] font-medium leading-relaxed">
              <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-[#E8E3D9] bg-gradient-to-r from-[#FAF8F3] to-white">
            <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
              <span className="w-3 h-8 bg-blue-500 rounded-full inline-block"></span>
              Global Cost & Revenue Projection
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9]">
                <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-2">Total Freight Cost</p>
                <p className="text-xl font-black text-[#1F2937]">Rp 325.500.000</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9]">
                <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-2">Total Insurance</p>
                <p className="text-xl font-black text-[#1F2937]">Rp 45.200.000</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9]">
                <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-widest mb-2">Total Export Value</p>
                <p className="text-xl font-black text-[#1F2937]">Rp 2.450.000.000</p>
              </div>
              <div className="p-5 rounded-2xl bg-green-50 border border-green-200">
                <p className="text-[10px] text-[#00A651] font-black uppercase tracking-widest mb-2">Est. Gross Margin</p>
                <p className="text-3xl font-black text-[#00A651]">28.5%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            className="rounded-2xl border-gray-300 text-gray-700 hover:bg-gray-50 font-bold h-14 px-8 shadow-sm"
            onClick={() => toast.info("PDF Generation is available for specific export cases.")}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Global PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
}
