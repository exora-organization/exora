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
        <Link href="/fs-dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#00A651] hover:bg-[#008F44] transition-all mb-4 px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z"/></svg>
          Back To Dashboard 
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Costing Configuration</h2>
        <p className="text-sm font-medium text-[#6B7280] mt-1">Input and manage direct and indirect costs.</p>
      </div>

      {exportCase && (
        <Card className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
          <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Case Name</p>
              <p className="font-extrabold text-[#1F2937] text-lg truncate">{exportCase.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Product</p>
              <p className="font-extrabold text-[#1F2937] text-lg truncate">{exportCase.product}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Destination</p>
              <p className="font-extrabold text-[#1F2937] text-lg truncate">{exportCase.destinationCountry}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
              <Badge className="mt-1 bg-[#EBF8F2] text-[#00A651] border-none font-bold px-3 py-1 uppercase tracking-wider text-[10px]">{exportCase.status.replace("_", " ")}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <CostingForm caseId={caseId} initialData={initialCostData} />
    </div>
  );
}
