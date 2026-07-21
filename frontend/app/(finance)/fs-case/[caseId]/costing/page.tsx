"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiCosting } from "../../../../../lib/api/costing";
import { apiExportCase } from "../../../../../lib/api/export-case";
import { CostingForm } from "../../../../../components/export-case/CostingForm";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";

export default function FinanceCostingPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const { data: caseData, isLoading: caseLoading } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const { data: costData, isLoading: costLoading } = useQuery({
    queryKey: ["cost-data", caseId],
    queryFn: () => apiCosting.getCostData(caseId),
    retry: false, 
  });

  if (caseLoading || costLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  const exportCase = caseData?.data;
  const initialCostData = costData?.data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/fs-dashboard" className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back To Dashboard 
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Costing Configuration</h2>
        <p className="text-[#9CA3AF] mt-1">Input and manage direct and indirect costs.</p>
      </div>

      {exportCase && (
        <Card className="bg-[#FAF8F3]">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Case Name</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Product</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Destination</p>
              <p className="font-semibold text-[#1F2937] truncate">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-xs text-[#9CA3AF] font-medium">Status</p>
              <Badge variant="outline" className="mt-1">{exportCase.status.replace("_", " ").toUpperCase()}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <CostingForm caseId={caseId} initialData={initialCostData} />
    </div>
  );
}
