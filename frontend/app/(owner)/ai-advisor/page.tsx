import { Card, CardContent } from "../../../components/ui/card";

export default function AiAdvisorPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Advisor</h2>
        <p className="text-gray-500 mt-1">Get AI-powered recommendations for your export cases.</p>
      </div>

      <Card>
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Advisor Not Supported Yet</h3>
          <p className="text-gray-500 max-w-sm">
            The backend API currently does not have an endpoint for the company-wide AI Advisor feature.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
