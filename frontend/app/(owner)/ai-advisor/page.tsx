"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { apiAdvisor } from "../../../lib/api/advisor";
import { apiAnalytics } from "../../../lib/api/analytics";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";
import { GenerateAdvisorRequest, AdvisorRecommendation } from "../../../lib/types/advisor";

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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1F2937]">AI Advisor</h2>
        <p className="text-[#9CA3AF] mt-1">
          Get company-wide strategic insights and trade finance recommendations compiled from all active export cases.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-[#FAF8F3]">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">Total Export Cases</p>
            <p className="font-semibold text-[#1F2937] truncate text-lg">{stats?.totalExportCases || 0}</p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium">Average Feasibility</p>
            <p className="font-semibold text-[#1F2937] truncate text-lg">
              {stats?.averageFeasibilityScore
                ? (stats.averageFeasibilityScore / 10).toFixed(1)
                : "0.0"} / 10
            </p>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] font-medium mb-1">Active Products</p>
            <div className="flex flex-wrap gap-1">
              {activeProducts.length > 0 ? (
                activeProducts.slice(0, 2).map((p: any, i: number) => (
                  <Badge key={i} variant="outline" className="bg-white border-[#E8E3D9] text-[#1F2937]">
                    {p.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-[#9CA3AF] block mt-1">Unknown</span>
              )}
              {activeProducts.length > 2 && (
                <Badge variant="outline" className="bg-white border-[#E8E3D9] text-[#9CA3AF]">
                  +{activeProducts.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 mt-6">
        {/* Ask the Advisor Panel */}
        <Card className="border-[#E8E3D9] shadow-sm shadow-[#E8E3D9]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1F2937]">Ask the Strategic Advisor</CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              Ask a specific question about your trade setup, shipping routes, or cost optimization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-[#E8E3D9] bg-white px-3 py-2 text-sm placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="flex justify-between items-center gap-3">
              <span className="text-xs text-[#9CA3AF]">Tip: Press Ctrl+Enter to send</span>
              <Button
                onClick={handleGenerate}
                className="bg-[#2F6B4F] hover:bg-[#25563F] text-white shadow-sm"
                disabled={isPending}
              >
                {isPending
                  ? "Analyzing trade profiles..."
                  : chatHistory.length > 0
                    ? "Ask Strategic Advisor"
                    : "Generate Global Strategy Report"
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loader */}
        {isPending && (
          <Card className="border-[#E8E3D9] bg-[#F5F8F6]/50">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="flex space-x-2 justify-center items-center mb-4">
                <div className="h-3 w-3 bg-[#2F6B4F] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-3 w-3 bg-[#2F6B4F] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-3 w-3 bg-[#2F6B4F] rounded-full animate-bounce"></div>
              </div>
              <p className="text-sm font-medium text-[#1F2937]">Consulting Trade Knowledge Base...</p>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
                Retrieving import regulations, evaluating payment terms, and matching Incoterm guidelines.
              </p>
            </CardContent>
          </Card>
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
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Previous Answers</h3>
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
          <Card className="border-dashed border-[#E8E3D9] bg-[#FAF8F3]/30">
            <CardContent className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-[#F5F8F6] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#4B5563]">No Global Report Generated Yet</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
                Generate your first strategic report to compile metrics across all active products and shipping portfolios.
              </p>
              <Button onClick={handleGenerate} className="mt-4 bg-[#2F6B4F] hover:bg-[#25563F] text-white" disabled={isPending}>
                Generate Global Analysis
              </Button>
            </CardContent>
          </Card>
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
    <div className="space-y-4">
      {/* Question bubble */}
      <div className="flex justify-end">
        <div className="bg-[#2F6B4F] text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
          {question}
        </div>
      </div>

      {/* Answer card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#F5F8F6]/50 rounded-lg border border-[#E8E3D9]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#2F6B4F] font-semibold uppercase tracking-wider">Confidence:</span>
            <Badge className={`capitalize ${
              recommendation.confidence === "high"
                ? "bg-[#2F6B4F] hover:bg-[#2F6B4F]"
                : recommendation.confidence === "medium"
                ? "bg-amber-500 hover:bg-amber-500"
                : "bg-slate-400 hover:bg-slate-400"
            }`}>
              {recommendation.confidence}
            </Badge>
            {isLatest && (
              <Badge variant="outline" className="text-[#2F6B4F] border-[#E8E3D9] bg-[#F5F8F6] text-[10px]">
                Latest
              </Badge>
            )}
          </div>
          <div className="text-xs text-[#9CA3AF] font-medium">
            {new Date(recommendation.generatedAt).toLocaleString()}
          </div>
        </div>

        <Card className="border-[#E8E3D9] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#E8E3D9]">
            <CardTitle className="text-xl text-[#1F2937]">Global Strategy & Trade Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm md:prose-base max-w-none prose-headings:text-[#1F2937] prose-a:text-[#2F6B4F] prose-strong:text-[#1F2937] text-[#4B5563] leading-relaxed">
              <ReactMarkdown>{recommendation.answer}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E8E3D9]">
          <CardHeader className="pb-3 border-b border-[#E8E3D9]">
            <CardTitle className="text-xl text-[#1F2937]">Global Cost & Revenue Projection</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Total Freight Cost</p>
                <p className="text-lg font-bold text-[#1F2937]">Rp 325.500.000</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Total Insurance</p>
                <p className="text-lg font-bold text-[#1F2937]">Rp 45.200.000</p>
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">Total Export Value</p>
                <p className="text-lg font-bold text-[#1F2937]">Rp 2.450.000.000</p>
              </div>
              <div className="bg-[#FAF8F3] p-3 rounded-lg border border-[#E8E3D9]">
                <p className="text-xs text-[#2F6B4F] font-bold uppercase tracking-wider mb-1">Est. Gross Margin</p>
                <p className="text-xl font-extrabold text-[#2F6B4F]">28.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button variant="outline" size="lg" className="border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#FAF8F3]" onClick={() => alert("PDF Generation is available for specific export cases.")}>
            Download Global PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
}
