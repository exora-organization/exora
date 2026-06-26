"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFinancial } from "../../../../../lib/api/financial";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { RecalculateAnalysisRequest } from "../../../../../lib/types/financial";
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

export default function FinancialAnalysisPage() {
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

  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ["financial-analysis", caseId],
    queryFn: () => apiFinancial.getAnalysis(caseId),
    retry: false,
  });

  const calculateMutation = useMutation({
    mutationFn: (data: RecalculateAnalysisRequest) => apiFinancial.recalculateAnalysis(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-analysis", caseId] });
      setErrorMsg(null);
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Failed to calculate financial analysis. Ensure cost and pricing data exist.");
    }
  });

  if (caseLoading || financialLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const analysis = financialData?.data?.analysis;

  const handleCalculate = () => {
    calculateMutation.mutate({ incoterm: selectedIncoterm });
  };

  const formatIDR = (value: number | undefined) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return "-";
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Financial Analysis</h2>
        <p className="text-gray-500 mt-1">Review revenue, profit margins, ROI, and break-even points.</p>
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
              {analysis ? (
                <Badge variant="default" className="mt-1">{analysis.selectedIncoterm}</Badge>
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
            {calculateMutation.isPending ? "Calculating..." : analysis ? "Recalculate Analysis" : "Calculate Analysis"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Revenue</p>
                <p className="text-xl font-bold mt-1 text-blue-600">{formatIDR(analysis.revenueIDR)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Gross Profit</p>
                <p className="text-xl font-bold mt-1 text-green-600">{formatIDR(analysis.grossProfitIDR)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Profit Margin</p>
                <p className="text-xl font-bold mt-1">{analysis.profitMarginPct}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">ROI</p>
                <p className="text-xl font-bold mt-1">{analysis.roiPct}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500 font-medium">Break Even Qty</p>
                <p className="text-xl font-bold mt-1">{formatNumber(analysis.breakEvenQty)} units</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Selected Incoterm</TableCell>
                    <TableCell className="text-right">{analysis.selectedIncoterm}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Target Quantity</TableCell>
                    <TableCell className="text-right">{formatNumber(analysis.quantity)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Selling Price / Unit</TableCell>
                    <TableCell className="text-right">{formatIDR(analysis.sellingPriceIDR)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Cost</TableCell>
                    <TableCell className="text-right">{formatIDR(analysis.totalCostIDR)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={() => router.push(`/export-case/${caseId}/scenarios`)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue to Scenario Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
