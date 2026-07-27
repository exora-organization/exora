"use client";

import { useParams } from "next/navigation";
import { FinancialAnalysis } from "../../../../../components/export-case/FinancialAnalysis";

export default function FinancialAnalysisPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  
  return (
    <div className="pt-2 pb-8">
      <FinancialAnalysis 
        caseId={caseId} 
        hideBackButton={true}
      />
    </div>
  );
}
