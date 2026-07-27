"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiRisk } from "../../../../../lib/api/risk";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function FeasibilityBadge({ value }: { value: string | undefined }) {
  if (!value) return null;
  if (value.includes("High"))
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">{value}</Badge>;
  if (value.includes("Moderate"))
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">{value}</Badge>;
  return <Badge className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-bold">{value}</Badge>;
}

function RiskBadge({ level }: { level: string | undefined }) {
  if (!level) return null;
  if (level === "Low")
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 text-xs font-bold">Low Risk</Badge>;
  if (level === "Medium")
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-3 text-xs font-bold">Moderate Risk</Badge>;
  return <Badge className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-3 text-xs font-bold">High Risk</Badge>;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(score, 100)}%` }}
      />
    </div>
  );
}

// ── Improvement Tips Generator ────────────────────────────────────────────────

type Tip = {
  icon: string;
  title: string;
  desc: string;
  action: string;
  href: string;
  impact: "High" | "Medium" | "Low";
};

function buildTips(
  assessment: any,
  caseId: string
): Tip[] {
  const tips: Tip[] = [];

  // 1. Payment Term (weight 20%) — easiest to change
  if (assessment.paymentTermScore < 100) {
    tips.push({
      icon: "solar:card-bold-duotone",
      title: "Switch Payment Term to L/C",
      desc:
        assessment.paymentTerm === "Open Account"
          ? "Open Account carries the highest payment risk (score: 25/100). Switching to Letter of Credit (L/C) immediately boosts your payment score to 100 and adds +15 points to feasibility."
          : assessment.paymentTerm === "Doc. Collection"
          ? "Documentary Collection scores 50/100. Upgrading to L/C (score: 100) adds up to +10 points to your overall feasibility."
          : "T/T scores 75/100. Consider Letter of Credit (L/C) for maximum payment security and a higher feasibility score.",
      action: "Update Cost Data → Payment Term",
      href: `/em-export-case/${caseId}/costing`,
      impact: "High",
    });
  }

  // 2. Profitability (weight 50%) — biggest lever
  if (assessment.profitabilityScore < 100) {
    const ratio = assessment.targetMarginPct > 0
      ? (assessment.actualMarginPct / assessment.targetMarginPct) * 100
      : 0;
    tips.push({
      icon: "solar:chart-bold-duotone",
      title: "Increase Actual Profit Margin",
      desc:
        ratio < 50
          ? `Your actual margin (${assessment.actualMarginPct.toFixed(1)}%) is less than 50% of your target (${assessment.targetMarginPct.toFixed(1)}%). Profitability contributes 50% of your feasibility score — reducing costs or raising the selling price is the fastest path to improvement.`
          : `Your actual margin (${assessment.actualMarginPct.toFixed(1)}%) is ${ratio.toFixed(0)}% of your target (${assessment.targetMarginPct.toFixed(1)}%). Reaching 100% of target unlocks a profitability score of 100 and adds up to +25 points to feasibility.`,
      action: "Adjust Cost Data or recalculate Pricing",
      href: `/em-export-case/${caseId}/costing`,
      impact: "High",
    });
  }

  // 3. Country Risk (weight 30%)
  if (assessment.countryRiskLevel !== "Low") {
    tips.push({
      icon: "solar:global-bold-duotone",
      title: "Consider Lower-Risk Export Destinations",
      desc: `${assessment.destinationCountry} is classified as ${assessment.countryRiskLevel} risk (score: ${assessment.countryRiskScore}/100). Destinations like Singapore, Japan, South Korea, USA, or UAE carry Low risk and score 100, contributing up to +6 additional feasibility points (weight: 30%).`,
      action: "Edit Export Case → Destination Country",
      href: `/em-export-case/${caseId}`,
      impact: "Medium",
    });
  }

  return tips;
}

const IMPACT_COLORS: Record<string, string> = {
  High: "bg-rose-50 border-rose-200 text-rose-700",
  Medium: "bg-amber-50 border-amber-200 text-amber-700",
  Low: "bg-blue-50 border-blue-200 text-blue-700",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RiskAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;
  const queryClient = useQueryClient();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false,
  });

  const {
    data: riskData,
    isLoading: riskLoading,
    error: riskError,
    refetch,
  } = useQuery({
    queryKey: ["risk-assessment", caseId],
    queryFn: () => apiRisk.getRiskAssessment(caseId),
    retry: false,
  });

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await queryClient.invalidateQueries({ queryKey: ["risk-assessment", caseId] });
    await queryClient.invalidateQueries({ queryKey: ["export-case", caseId] });
    await refetch();
    setIsRecalculating(false);
  };

  if (caseLoading || riskLoading) {
    return (
      <div className="p-8 flex flex-col items-center gap-3 text-[#6B7280]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]" />
        <p className="text-sm font-medium">Calculating risk assessment…</p>
      </div>
    );
  }

  const exportCase = caseData?.data;
  const assessment = riskData?.data?.assessment;
  const activeIncoterm = pricingData?.data?.pricing?.incoterm;
  const tips = assessment ? buildTips(assessment, caseId) : [];

  return (
    <div className="space-y-6 pt-2 pb-8">

      {/* ── Case Header ── */}
      {exportCase && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Product</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Destination</p>
              <p className="font-extrabold text-[#1F2937] truncate mt-1">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Active Incoterm</p>
              {activeIncoterm ? (
                <Badge className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-full px-3">{activeIncoterm}</Badge>
              ) : (
                <span className="text-sm text-[#9CA3AF] mt-1 block font-bold">Unknown</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Error: prerequisites missing ── */}
      {riskError && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <Icon icon="solar:danger-circle-bold-duotone" className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-rose-700 text-base mb-1">Prerequisites Incomplete</h3>
              <p className="text-sm text-rose-600 font-medium mb-4">
                Risk assessment requires the following steps to be completed first:
              </p>
              <div className="space-y-2">
                {[
                  { label: "Cost Data", href: `/em-export-case/${caseId}/costing`, icon: "solar:calculator-bold-duotone" },
                  { label: "Pricing Calculation", href: `/em-export-case/${caseId}/pricing`, icon: "solar:tag-price-bold-duotone" },
                  { label: "Financial Analysis", href: `/em-export-case/${caseId}/financial`, icon: "solar:chart-square-bold-duotone" },
                ].map((step) => (
                  <button
                    key={step.href}
                    onClick={() => router.push(step.href)}
                    className="flex items-center gap-2 text-sm font-bold text-rose-700 hover:text-rose-900 hover:underline"
                  >
                    <Icon icon={step.icon} className="w-4 h-4" />
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assessment Results ── */}
      {assessment && (
        <div className="space-y-6">

          {/* Overall Feasibility Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-white/60 hover:-translate-y-1">
            <div>
              <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest mb-2">Overall Feasibility Score</p>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-[#1F2937]">
                  {assessment.feasibilityScore.toFixed(1)}
                  <span className="text-[#6B7280] text-2xl font-bold"> / 100</span>
                </span>
                <div className="scale-110 origin-left">
                  <FeasibilityBadge value={assessment.feasibilityClass} />
                </div>
              </div>
              <p className="text-xs text-[#9CA3AF] font-medium mt-2">
                Profitability (50%) · Country Risk (30%) · Payment Term (20%)
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 mt-4 sm:mt-0">
              <div className="text-right">
                <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-widest">Last Calculated</p>
                <p className="text-sm font-bold mt-1 text-[#4B5563]">{new Date(assessment.calculatedAt).toLocaleString()}</p>
              </div>
              <Button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                variant="outline"
                className="rounded-full px-5 h-9 text-xs font-bold border-gray-300 hover:border-[#00A651] hover:text-[#00A651] transition-all"
              >
                {isRecalculating ? (
                  <><Icon icon="solar:refresh-bold-duotone" className="w-4 h-4 mr-1.5 animate-spin" /> Recalculating…</>
                ) : (
                  <><Icon icon="solar:refresh-bold-duotone" className="w-4 h-4 mr-1.5" /> Recalculate</>
                )}
              </Button>
            </div>
          </div>

          {/* Score Breakdown Grid */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Country Risk */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1F2937]">Country Risk</h3>
                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">Weight 30%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-[#1F2937]">{assessment.countryRiskScore.toFixed(0)}<span className="text-lg text-gray-400 font-bold">/100</span></span>
                <RiskBadge level={assessment.countryRiskLevel} />
              </div>
              <ScoreBar score={assessment.countryRiskScore} color="bg-blue-400" />
              <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                Based on economic and political stability of{" "}
                <strong className="text-[#1F2937] font-extrabold">{assessment.destinationCountry}</strong>.
              </p>
              <p className="text-xs text-[#9CA3AF] font-medium">
                Low risk markets: Singapore, Japan, South Korea, USA, UAE
              </p>
            </div>

            {/* Payment Risk */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1F2937]">Payment Risk</h3>
                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">Weight 20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-[#1F2937]">{assessment.paymentTermScore.toFixed(0)}<span className="text-lg text-gray-400 font-bold">/100</span></span>
                <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{assessment.paymentTerm}</span>
              </div>
              <ScoreBar score={assessment.paymentTermScore} color="bg-purple-400" />
              <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
                Reliability of your chosen payment method in securing export funds.
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-[#9CA3AF] font-medium">
                <span>L/C → 100</span>
                <span>T/T → 75</span>
                <span>Doc. Collection → 50</span>
                <span>Open Account → 25</span>
              </div>
            </div>

            {/* Profitability Risk */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:-translate-y-1 transition-transform flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1F2937]">Profitability</h3>
                <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full">Weight 50%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-black text-[#1F2937]">{assessment.profitabilityScore.toFixed(0)}<span className="text-lg text-gray-400 font-bold">/100</span></span>
              </div>
              <ScoreBar score={assessment.profitabilityScore} color="bg-emerald-400" />
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                  <span className="text-[#9CA3AF] font-bold">Actual Margin</span>
                  <span className="font-extrabold text-[#1F2937]">{assessment.actualMarginPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-1">
                  <span className="text-[#9CA3AF] font-bold">Target Margin</span>
                  <span className="font-extrabold text-[#1F2937]">{assessment.targetMarginPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#9CA3AF] font-bold">Achievement</span>
                  <span className={`font-extrabold ${assessment.actualMarginPct >= assessment.targetMarginPct ? "text-emerald-600" : "text-rose-500"}`}>
                    {assessment.targetMarginPct > 0 ? ((assessment.actualMarginPct / assessment.targetMarginPct) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── How to Improve Feasibility ── */}
          {tips.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Icon icon="solar:lightbulb-bold-duotone" className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1F2937] text-base">How to Improve Your Feasibility Score</h3>
                  <p className="text-xs text-[#9CA3AF] font-medium">
                    Results update automatically when you change inputs — click Recalculate after editing.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Icon icon={tip.icon} className="w-5 h-5 text-[#00A651]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-extrabold text-[#1F2937] text-sm">{tip.title}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${IMPACT_COLORS[tip.impact]}`}>
                          {tip.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] font-medium leading-relaxed mb-2">{tip.desc}</p>
                      <button
                        onClick={() => router.push(tip.href)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A651] hover:text-[#008F44] hover:underline transition-colors"
                      >
                        <Icon icon="solar:arrow-right-bold" className="w-3.5 h-3.5" />
                        {tip.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                <p className="text-xs text-[#9CA3AF] font-medium">
                  After editing Cost Data or Pricing, return here and click <strong className="text-[#6B7280]">Recalculate</strong> to see updated results.
                </p>
              </div>
            </div>
          )}

          {/* Perfect score message */}
          {tips.length === 0 && (
            <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <Icon icon="solar:verified-check-bold-duotone" className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-700 text-sm">Excellent! All risk factors are optimal.</h4>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">Your export case is in the best possible position for all risk components.</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => router.push(`/em-export-case/${caseId}?tab=advisor`)}
              className="bg-[#00A651] hover:bg-[#008F44] text-white rounded-full px-8 h-12 text-[13px] font-bold shadow-md hover:shadow-lg transition-all group"
            >
              Continue to AI Advisor
              <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
