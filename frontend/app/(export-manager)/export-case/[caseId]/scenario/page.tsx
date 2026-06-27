import { Card, CardContent } from "../../../../../components/ui/card";
import Link from "next/link";

export default function ScenarioAnalysisPage({ params }: { params: { caseId: string } }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href={`/export-case/${params.caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Scenario Analysis</h2>
        <p className="text-gray-500 mt-1">Simulate financial outcomes based on varying market conditions.</p>
      </div>

      <Card>
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Scenario Module Coming Soon</h3>
          <p className="text-gray-500 max-w-sm">
            The distinct Scenario Analysis module is currently under development on the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
