import { Card, CardContent } from "../../../../../components/ui/card";
import Link from "next/link";

export default function FeasibilityScorePage({ params }: { params: { caseId: string } }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href={`/export-case/${params.caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Feasibility Score</h2>
        <p className="text-gray-500 mt-1">Review the overall quantitative feasibility assessment for this export case.</p>
      </div>

      <Card>
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Feasibility Module Coming Soon</h3>
          <p className="text-gray-500 max-w-sm">
            The separate Feasibility Score module is currently under development on the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
