"use client";

import { Card, CardContent } from "../../../components/ui/card";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-gray-500 mt-1">Review system activities and security events.</p>
      </div>

      <Card>
        <CardContent className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Audit logs are not available yet.</h3>
          <p className="text-gray-500 max-w-sm">
            The backend API endpoint for retrieving audit logs has not been implemented yet. 
            Once the endpoint is available, this page will display real-time system activities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
