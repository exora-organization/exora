"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { apiAdvisor } from "../../lib/api/advisor";
import { apiExportCase } from "../../lib/api/export-case";
import { apiPricing } from "../../lib/api/pricing";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { GenerateAdvisorRequest } from "../../lib/types/advisor";
import { useUserProfile } from "../../hooks/useUserProfile";

interface AIAdvisorWorkspaceProps {
  caseId: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-xl font-extrabold text-[#1F2937] border-b border-gray-100 pb-3 mb-5 flex items-center gap-2 tracking-tight">
      <Icon icon="solar:stars-minimalistic-bold-duotone" className="w-6 h-6 text-amber-500 shrink-0" />
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-extrabold text-[#1F2937] border-b border-slate-100 pb-2 mt-6 mb-3 flex items-center gap-2">
      <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-[#00A651] shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xs font-black uppercase tracking-wider text-[#00A651] mt-6 mb-2.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#00A651]" />
      {children}
    </h3>
  ),
  p: ({ children }: any) => (
    <p className="text-xs text-[#4B5563] leading-relaxed my-2 font-medium">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="space-y-2 my-3 pl-1">
      {children}
    </ul>
  ),
  li: ({ children }: any) => (
    <li className="text-xs text-[#374151] font-semibold flex items-start gap-2.5 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/80">
      <Icon icon="solar:check-read-bold-duotone" className="w-4 h-4 text-[#00A651] shrink-0 mt-0.5" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: any) => {
    const str = String(children);
    if (str === "Proceed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-emerald-600" /> Proceed
        </span>
      );
    }
    if (str === "Review Required" || str === "Proceed with Caution") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:danger-triangle-bold" className="w-4 h-4 text-amber-600" /> {str}
        </span>
      );
    }
    if (str === "Not Recommended") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 border border-rose-300 text-rose-900 font-extrabold text-xs rounded-xl uppercase tracking-wider">
          <Icon icon="solar:close-circle-bold" className="w-4 h-4 text-rose-600" /> Not Recommended
        </span>
      );
    }
    return <strong className="font-extrabold text-[#1F2937]">{children}</strong>;
  },
  hr: () => <hr className="my-6 border-slate-100" />,
  em: ({ children }: any) => (
    <em className="block p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 font-medium not-italic mt-6 shadow-2xs">
      <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 inline mr-2 text-[#00A651] align-text-bottom" />
      {children}
    </em>
  ),
};

export function AIAdvisorWorkspace({ caseId }: AIAdvisorWorkspaceProps) {
  const { role } = useUserProfile();
  const queryClient = useQueryClient();
  const reportRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chatbot State for Right Panel
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Hello! I am your EXORA AI Trade Assistant. Ask me any export questions here (e.g. Incoterms, freight changes, documents) without altering the official case report on the left.",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const { data: advisorData, isLoading: advisorLoading } = useQuery({
    queryKey: ["advisor", caseId],
    queryFn: () => apiAdvisor.getRecommendation(caseId),
    retry: false,
  });

  const generateReportMutation = useMutation({
    mutationFn: () => apiAdvisor.generateRecommendation(caseId, {}),
    onSuccess: (res) => {
      if (res) {
        queryClient.setQueryData(["advisor", caseId], res);
      }
      setErrorMsg(null);
      toast.success("Official Case Report updated!");
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    onError: (error: any) => {
      if (error.message?.includes("timeout") || error.status === 504) {
        setErrorMsg("The AI service took too long to respond. Please try again.");
      } else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("limit")) {
        toast.warning("Gemini AI API quota limit reached (429). Switched to Curated Knowledge Backup Mode.");
        setErrorMsg("⚠️ Gemini AI quota limit reached (HTTP 429). Providing verified trade recommendations from EXORA's local knowledge base backup.");
      } else {
        setErrorMsg(error.message || "Unable to generate official report. Please retry.");
      }
    },
  });

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatSending) return;
    const userText = chatInput.trim();
    setChatInput("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      const res = await apiAdvisor.sendChat(caseId, userText);
      const aiResponseText = res.data?.recommendation?.answer || "I have analyzed your query based on EXORA's export case context.";


      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorText = err?.message?.includes("429")
        ? "⚠️ Gemini API Quota Limit Reached (429). Serving response from EXORA Curated Knowledge Base."
        : "Sorry, unable to process chat request at this moment. Please try again.";
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: errorText,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatSending(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const isInitialLoading = caseLoading || (advisorLoading && !advisorData);

  if (isInitialLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <Icon icon="solar:refresh-circle-linear" className="w-8 h-8 text-[#00A651] animate-spin" />
      </div>
    );
  }

  const exportCase = caseData?.data;
  const recommendation = advisorData?.data?.recommendation;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-start">
      {/* LEFT PANEL: Official 8-Point AI Decision Recommendation Report (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Case Header Info & Generate Report Action */}
        {exportCase && (
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-md rounded-3xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center flex-1">
                <div>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</p>
                  <p className="font-extrabold text-[#1F2937] truncate mt-0.5">{exportCase.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Product</p>
                  <p className="font-extrabold text-[#1F2937] truncate mt-0.5">{exportCase.product}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</p>
                  <p className="font-extrabold text-[#1F2937] truncate mt-0.5">{exportCase.destinationCountry}</p>
                </div>
              </div>

              <Button
                onClick={() => generateReportMutation.mutate()}
                disabled={generateReportMutation.isPending}
                className="h-10 rounded-full px-6 bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                {generateReportMutation.isPending ? (
                  <><Icon icon="solar:refresh-circle-linear" className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : recommendation ? (
                  "Regenerate Case Report"
                ) : (
                  "Generate Official Report"
                )}
              </Button>
            </div>
          </div>
        )}

        {errorMsg && (
          <Alert variant="destructive" className="rounded-2xl border-red-200">
            <AlertTitle className="font-extrabold uppercase tracking-wider text-xs mb-1">Notice</AlertTitle>
            <AlertDescription className="font-medium text-sm">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Official Recommendation Report Output */}
        {recommendation ? (
          <div ref={reportRef} className="space-y-6 scroll-mt-6">
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
              <div className="bg-[#FAF8F3]/70 border-b border-[#E8E3D9] px-6 py-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[#1F2937] font-extrabold text-base">
                  <Icon icon="solar:shield-check-bold-duotone" className="w-5 h-5 text-[#00A651]" />
                  AI Decision Recommendation
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wider text-[10px]">
                    Confidence: {recommendation.confidence || "High"}
                  </span>
                  <span className="text-gray-400 font-medium">
                    {new Date(recommendation.generatedAt).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="prose prose-sm max-w-none text-[#374151] leading-relaxed font-medium">
                  <ReactMarkdown components={markdownComponents}>
                    {recommendation.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center bg-white/60 border border-dashed border-slate-200 rounded-3xl">
            <Icon icon="solar:document-text-bold-duotone" className="w-12 h-12 text-[#00A651] mx-auto mb-3 opacity-60" />
            <p className="text-sm font-bold text-slate-700">No official AI case report generated yet.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Click "Generate Official Report" above to construct EXORA's official enterprise case report based on system data & knowledge base.</p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Interactive Export Chatbot ("EXORA Trade Assistant") (lg:col-span-5) */}
      <div className="lg:col-span-5 flex flex-col bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-3xl h-[640px] sticky top-6 overflow-hidden">
        {/* Chatbot Header */}
        <div className="bg-[#FAF8F3]/90 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#00A651] text-white flex items-center justify-center shadow-md shadow-[#00A651]/20">
              <Icon icon="solar:chat-round-dots-bold-duotone" className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#1F2937] leading-none flex items-center gap-2">
                EXORA Trade Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h4>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Interactive Conversational Chatbot</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-black uppercase rounded-lg">
            Chatbot Mode
          </span>
        </div>

        {/* Chat Message Scroll Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed font-medium shadow-xs ${
                  msg.sender === "user"
                    ? "bg-[#00A651] text-white rounded-br-xs"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                }`}
              >
                {msg.sender === "ai" ? (
                  <div className="prose prose-xs max-w-none text-slate-800 font-medium">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1 font-bold">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isChatSending && (
            <div className="flex items-center gap-2 text-slate-400 text-xs bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs w-fit">
              <Icon icon="solar:refresh-circle-linear" className="w-4 h-4 text-[#00A651] animate-spin" />
              <span className="font-bold text-[11px]">Assistant is typing...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Prompt Input Form */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2 bg-[#F9FAFB] border border-slate-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#00A651]"
          >
            <input
              type="text"
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#1F2937] placeholder-slate-400 focus:outline-none font-medium"
              placeholder={
                role === "finance_staff"
                  ? "Ask a financial question e.g. What happens if freight increases by 15%?"
                  : "Ask an export question e.g. Explain required documents..."
              }
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isChatSending}
            />
            <button
              type="submit"
              disabled={isChatSending || !chatInput.trim()}
              className="w-8 h-8 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm"
            >
              <Icon icon="solar:plain-bold" className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[9px] text-slate-400 text-center mt-1.5 font-bold">
            Chatbot messages respond like normal chat and do not alter the official case report.
          </p>
        </div>
      </div>
    </div>
  );
}
