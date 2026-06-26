import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function ExportManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Export Manager Dashboard</h2>
      
      {/* Overview Statistics (Placeholders) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Export cases assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Cases currently in review or draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Recently updated feasibility scores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-4">
        <Link href="/export-case">
          <Button variant="outline">View All Export Cases</Button>
        </Link>
        <Link href="/export-case/new">
          <Button>Create New Case</Button>
        </Link>
      </div>
    </div>
  );
}
