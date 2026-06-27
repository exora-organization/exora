"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiPricing } from "../../../../../lib/api/pricing";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { CalculatePricingRequest } from "../../../../../lib/types/pricing";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
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
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Pricing Configuration</h2>
        <p className="text-gray-500 mt-1">Calculate authoritative export prices using the EXORA pricing engine.</p>
      </div>

      {exportCase && (
        <Card className="bg-slate-50">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Case Name</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Product</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Destination</p>
              <p className="font-semibold text-slate-900 truncate">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Incoterm</p>
              {pricingResult ? (
                <Badge variant="default" className="mt-1">{pricingResult.incoterm}</Badge>
              ) : (
                <span className="text-sm text-gray-400 mt-1 block">Not Calculated</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Incoterm Selection</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedIncoterm}
              onChange={(e) => setSelectedIncoterm(e.target.value as any)}
            >
              <option value="EXW">EXW (Ex Works)</option>
              <option value="FOB">FOB (Free On Board)</option>
              <option value="CFR">CFR (Cost and Freight)</option>
              <option value="CIF">CIF (Cost, Insurance, and Freight)</option>
            </select>
          </div>
          <Button onClick={handleCalculate} disabled={calculateMutation.isPending}>
            {calculateMutation.isPending ? "Calculating..." : pricingResult ? "Recalculate Pricing" : "Calculate Pricing"}
          </Button>
        </CardContent>
      </Card>

      {pricingResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Total Cost</p>
                <p className="text-xl font-bold mt-1">{formatIDR(pricingResult.totalCostIDR)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Profit</p>
                <p className="text-xl font-bold mt-1 text-green-600">{formatIDR(pricingResult.profitIDR)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Selling Price (USD)</p>
                <p className="text-xl font-bold mt-1 text-blue-600">{formatUSD(pricingResult.sellingPriceUSD)}</p>
                <p className="text-xs text-gray-400 mt-1">@ {formatIDR(pricingResult.exchangeRate)} / USD</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Actual Margin</p>
                <p className="text-xl font-bold mt-1">{pricingResult.actualMarginPct}%</p>
                <p className="text-xs text-gray-400 mt-1">Target: {pricingResult.targetMargin}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cost Component</TableHead>
                    <TableHead className="text-right">Amount (IDR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Production Cost (HPP)</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.hpp)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Packaging</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.packaging)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Certification</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.certification)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Transportation</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.transportation)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Freight</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.freight)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Insurance</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.insurance)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold border-t-2">
                    <TableCell>Total Cost</TableCell>
                    <TableCell className="text-right">{formatIDR(pricingResult.breakdown.totalCostIDR)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/export-case/${caseId}/financial`)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue to Financial Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
