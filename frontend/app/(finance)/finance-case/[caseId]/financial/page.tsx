"use client";

import { useParams } from "next/navigation";
import { FinancialAnalysis } from "../../../../../components/export-case/FinancialAnalysis";

export default function FinanceFinancialPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  
  return (
    <FinancialAnalysis 
      caseId={caseId} 
      backUrl="/finance-dashboard" 
    />
  );
}
