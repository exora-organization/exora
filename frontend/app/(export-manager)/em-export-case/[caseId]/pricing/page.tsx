"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiPricing } from "../../../../../lib/api/pricing";
import { Icon } from "@iconify/react";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { CalculatePricingRequest } from "../../../../../lib/types/pricing";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;

  const [selectedIncoterm, setSelectedIncoterm] = useState<"EXW" | "FOB" | "CFR" | "CIF">("FOB");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: pricingData, isLoading: pricingLoading } = useQuery({
    queryKey: ["pricing", caseId],
    queryFn: () => apiPricing.getPricing(caseId),
    retry: false, 
  });

  const calculateMutation = useMutation({
    mutationFn: (data: CalculatePricingRequest) => apiPricing.calculatePricing(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing", caseId] });
      setErrorMsg(null);
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Failed to calculate pricing. Ensure cost data is saved first.");
    }
  });

  if (caseLoading || pricingLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const pricingResult = pricingData?.data?.pricing;

  const handleCalculate = () => {
    calculateMutation.mutate({ incoterm: selectedIncoterm });
  };

  const formatIDR = (value: number | undefined) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  const formatUSD = (value: number | undefined) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  return (
    <div className="space-y-6 pt-2 pb-8">

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
              {pricingResult ? (
                <Badge className="mt-1 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-full px-3">{pricingResult.incoterm}</Badge>
              ) : (
                <span className="text-sm text-[#9CA3AF] mt-1 block font-bold">Not Calculated</span>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-extrabold text-[#1F2937]">Incoterm Selection</h3>
          <span className="text-xs font-bold text-[#00A651] bg-[#EBF8F2] px-3 py-1 rounded-full border border-[#00A651]/20">
            Incoterms 2020 Rules Applied
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:max-w-md relative">
            <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              className="appearance-none flex h-12 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
              value={selectedIncoterm}
              onChange={(e) => setSelectedIncoterm(e.target.value as any)}
            >
              <option value="EXW">EXW — Ex Works (Factory Pick-up)</option>
              <option value="FOB">FOB — Free On Board (Loaded at Origin Port)</option>
              <option value="CFR">CFR — Cost & Freight (Freight Paid to Destination)</option>
              <option value="CIF">CIF — Cost, Insurance & Freight (Full Coverage)</option>
            </select>
          </div>
          <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="h-12 rounded-full px-8 bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md w-full sm:w-auto">
            {calculateMutation.isPending ? "Calculating..." : pricingResult ? "Recalculate Pricing" : "Calculate Pricing"}
          </Button>
        </div>

        {/* Incoterms Educational Guide Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {[
            {
              code: "EXW",
              name: "Ex Works",
              scope: "HPP + Pkg + Cert",
              buyerPays: "Transport, Freight, Insurance",
              desc: "Exporter only prepares goods at factory. Buyer handles all logistics.",
            },
            {
              code: "FOB",
              name: "Free On Board",
              scope: "EXW + Transport",
              buyerPays: "Ocean Freight, Insurance",
              desc: "Exporter delivers cargo onto vessel at origin port. Most popular for sea freight.",
            },
            {
              code: "CFR",
              name: "Cost & Freight",
              scope: "FOB + Ocean Freight",
              buyerPays: "Marine Insurance",
              desc: "Exporter pays ocean shipping to destination port. Buyer arranges insurance.",
            },
            {
              code: "CIF",
              name: "Cost, Insurance & Freight",
              scope: "CFR + Marine Insurance",
              buyerPays: "Import Clearance Only",
              desc: "Exporter covers full logistics & insurance to destination port.",
            },
          ].map((item) => {
            const isSelected = selectedIncoterm === item.code;
            return (
              <div
                key={item.code}
                onClick={() => setSelectedIncoterm(item.code as any)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-50/90 border-[#00A651] ring-2 ring-[#00A651]/20 shadow-sm"
                    : "bg-gray-50/70 border-gray-200 hover:border-gray-300 hover:bg-gray-100/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-base font-black ${isSelected ? "text-[#00A651]" : "text-[#1F2937]"}`}>
                      {item.code}
                    </span>
                    {isSelected && (
                      <Badge className="bg-[#00A651] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">Active</Badge>
                    )}
                  </div>
                  <p className="font-extrabold text-[#1F2937] text-xs mb-1.5">{item.name}</p>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-200/80 text-[11px] space-y-1">
                  <p className="text-[#00A651] font-bold">
                    <span className="text-gray-400 font-semibold">Includes:</span> {item.scope}
                  </p>
                  <p className="text-amber-700 font-bold">
                    <span className="text-gray-400 font-semibold">Buyer pays:</span> {item.buyerPays}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pricingResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">
                Total Cost ({pricingResult.incoterm} Scope)
              </p>
              <p className="text-2xl font-extrabold mt-1 text-[#1F2937]">{formatIDR(pricingResult.totalCostIDR)}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1">Excludes buyer-paid components</p>
            </div>
            <div className="bg-emerald-50/90 backdrop-blur-xl border border-emerald-100 shadow-xl rounded-3xl p-5 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Profit</p>
              <p className="text-2xl font-extrabold mt-1 text-emerald-700">{formatIDR(pricingResult.profitIDR)}</p>
            </div>
            <div className="bg-blue-50/90 backdrop-blur-xl border border-blue-100 shadow-xl rounded-3xl p-5 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Selling Price (USD)</p>
              <p className="text-2xl font-extrabold mt-1 text-blue-700">{formatUSD(pricingResult.sellingPriceUSD)}</p>
              <p className="text-[11px] font-bold text-blue-500/80 mt-1">@ {formatIDR(pricingResult.exchangeRate)} / USD</p>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Actual Margin</p>
              <p className="text-2xl font-extrabold mt-1 text-[#1F2937]">{pricingResult.actualMarginPct}%</p>
              <p className="text-[11px] font-bold text-[#9CA3AF] mt-1">Target: {pricingResult.targetMargin}%</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#1F2937]">Cost Breakdown ({pricingResult.incoterm})</h3>
              <span className="text-xs font-bold text-gray-500">
                Amounts reflect exporter obligations under <strong>{pricingResult.incoterm}</strong>
              </span>
            </div>
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-gray-100 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Cost Component</TableHead>
                    <TableHead className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest text-right">Amount (IDR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">Production Cost (HPP)</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.hpp)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">Packaging</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.packaging)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">Certification</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.certification)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">
                      Transportation
                      {pricingResult.incoterm === "EXW" && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                          Excluded under EXW (Borne by Buyer)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.transportation)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">
                      Freight
                      {(pricingResult.incoterm === "EXW" || pricingResult.incoterm === "FOB") && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                          Excluded under {pricingResult.incoterm} (Borne by Buyer)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.freight)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">
                      Insurance
                      {pricingResult.incoterm !== "CIF" && (
                        <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                          Excluded under {pricingResult.incoterm} (Borne by Buyer)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.insurance)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-4 border-gray-200 hover:bg-transparent">
                    <TableCell className="font-extrabold text-lg text-[#1F2937]">Total Cost ({pricingResult.incoterm})</TableCell>
                    <TableCell className="font-extrabold text-lg text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.totalCostIDR)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/em-export-case/${caseId}/financial`)} className="bg-[#00A651] hover:bg-[#008F44] text-white rounded-full px-8 h-12 text-[13px] font-bold shadow-md hover:shadow-lg transition-all group">
              Continue to Financial Analysis <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
