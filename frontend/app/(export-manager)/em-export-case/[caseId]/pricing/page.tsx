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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={`/em-export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Pricing Configuration</h2>
        <p className="text-sm text-[#6B7280] font-medium mt-1">Calculate authoritative export prices using the EXORA pricing engine.</p>
      </div>

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

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
        <h3 className="text-xl font-extrabold text-[#1F2937] mb-4">Incoterm Selection</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full sm:max-w-xs relative">
            <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              className="appearance-none flex h-12 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
              value={selectedIncoterm}
              onChange={(e) => setSelectedIncoterm(e.target.value as any)}
            >
              <option value="EXW">EXW (Ex Works)</option>
              <option value="FOB">FOB (Free On Board)</option>
              <option value="CFR">CFR (Cost and Freight)</option>
              <option value="CIF">CIF (Cost, Insurance, and Freight)</option>
            </select>
          </div>
          <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="h-12 rounded-full px-8 bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md w-full sm:w-auto">
            {calculateMutation.isPending ? "Calculating..." : pricingResult ? "Recalculate Pricing" : "Calculate Pricing"}
          </Button>
        </div>
      </div>

      {pricingResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Total Cost</p>
              <p className="text-2xl font-extrabold mt-1 text-[#1F2937]">{formatIDR(pricingResult.totalCostIDR)}</p>
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
            <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
              <h3 className="text-xl font-extrabold text-[#1F2937]">Cost Breakdown</h3>
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
                    <TableCell className="font-bold text-[#4B5563]">Transportation</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.transportation)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">Freight</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.freight)}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-[#F9FAFB]">
                    <TableCell className="font-bold text-[#4B5563]">Insurance</TableCell>
                    <TableCell className="font-black text-[#1F2937] text-right">{formatIDR(pricingResult.breakdown.insurance)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-4 border-gray-200 hover:bg-transparent">
                    <TableCell className="font-extrabold text-lg text-[#1F2937]">Total Cost</TableCell>
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
