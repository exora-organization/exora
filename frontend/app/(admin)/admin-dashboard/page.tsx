import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Pending Review</div>
            <p className="text-xs text-gray-500 mt-1">
              Manage new company applications
            </p>
            <div className="mt-4">
              <Link href="/company-approvals">
                <Button variant="outline" size="sm" className="w-full">View Approvals</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
