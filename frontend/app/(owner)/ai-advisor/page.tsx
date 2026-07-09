"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

  // Fetch existing global recommendation (initial load only)
  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ["global-advisor"],
    queryFn: () => apiAdvisor.getGlobalRecommendation(),
    retry: false, // Don't spam if there isn't one yet (returns 404)
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
            recommendation: data.data.recommendation,
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

  // Prioritise: chat history first, then initial load recommendation
  const initialRecommendation = advisorData?.data?.recommendation;
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
        <h2 className="text-3xl font-bold tracking-tight">AI Advisor</h2>
        <p className="text-gray-500 mt-1">
          Get company-wide strategic insights and trade finance recommendations compiled from all active export cases.
        </p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Context Cases */}
        <div className="space-y-6">
          <Card className="bg-slate-50/50 border-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">Seeded Context</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Data used by the AI engine to generate recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Total Export Cases</span>
                <span className="font-bold text-slate-800">{stats?.totalExportCases || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Average Feasibility</span>
                <span className="font-bold text-slate-800">
                  {stats?.averageFeasibilityScore
                    ? (stats.averageFeasibilityScore / 10).toFixed(1)
                    : "0.0"} / 10
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Active Products</h4>
                <div className="space-y-1.5">
                  {activeProducts.length > 0 ? (
                    activeProducts.map((p: any, i: number) => (
                      <div key={i} className="text-xs bg-white border border-slate-100 p-2 rounded-md shadow-sm">
                        <p className="font-medium text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">Target: {p.label}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No active cases found.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Chat/Report Interface */}
        <div className="md:col-span-2 space-y-6">
          {/* Ask the Advisor Panel */}
          <Card className="border-indigo-100 shadow-sm shadow-indigo-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-indigo-900">Ask the Strategic Advisor</CardTitle>
              <CardDescription>
                Ask a specific question about your trade setup, shipping routes, or cost optimization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <span className="text-xs text-slate-400">Tip: Press Ctrl+Enter to send</span>
                <Button
                  onClick={handleGenerate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  disabled={isPending}
                >
                  {isPending
                    ? "Analyzing trade profiles..."
                    : chatHistory.length > 0 || initialRecommendation
                      ? "Ask Strategic Advisor"
                      : "Generate Global Strategy Report"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loader */}
          {isPending && (
            <Card className="border-indigo-50 bg-indigo-50/10">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <div className="flex space-x-2 justify-center items-center mb-4">
                  <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-3 w-3 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <p className="text-sm font-medium text-indigo-900">Consulting Trade Knowledge Base...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
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
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous Answers</h3>
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

          {/* Initial load recommendation (when no chat history yet) */}
          {!isPending && chatHistory.length === 0 && initialRecommendation && !advisorLoading && (
            <RecommendationCard
              question="Previous Report"
              recommendation={initialRecommendation}
              isLatest={false}
            />
          )}

          {/* Initial State / Empty Recommendation */}
          {!isPending && chatHistory.length === 0 && !initialRecommendation && !advisorLoading && (
            <Card className="border-dashed border-slate-200 bg-slate-50/30">
              <CardContent className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-700">No Global Report Generated Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Generate your first strategic report to compile metrics across all active products and shipping portfolios.
                </p>
                <Button onClick={handleGenerate} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isPending}>
                  Generate Global Analysis
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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
        <div className="bg-indigo-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%] shadow-sm">
          {question}
        </div>
      </div>

      {/* Answer card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider">Confidence:</span>
            <Badge className={`capitalize ${
              recommendation.confidence === "high"
                ? "bg-emerald-600 hover:bg-emerald-600"
                : recommendation.confidence === "medium"
                ? "bg-amber-500 hover:bg-amber-500"
                : "bg-slate-400 hover:bg-slate-400"
            }`}>
              {recommendation.confidence}
            </Badge>
            {isLatest && (
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 text-[10px]">
                Latest
              </Badge>
            )}
          </div>
          <div className="text-xs text-indigo-500 font-medium">
            {new Date(recommendation.generatedAt).toLocaleString()}
          </div>
        </div>

        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-xl text-slate-800">Global Strategy & Trade Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm md:prose-base max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
              {recommendation.answer}
            </div>
          </CardContent>
        </Card>

        {(recommendation.sources?.length ?? 0) > 0 && (
          <Card className="border-slate-100 bg-slate-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Sources Consulted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendation.sources!.map((source, i) => (
                  <Badge key={i} variant="outline" className="bg-white text-slate-500 border-slate-200">
                    {source}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
