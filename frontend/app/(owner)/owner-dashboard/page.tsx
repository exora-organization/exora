import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Owner Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              View and manage your company details
            </p>
            <Link href="/company-profile">
              <Button variant="outline" size="sm" className="w-full">View Profile</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Invite export managers and finance staff
            </p>
            <Link href="/team-management">
              <Button variant="outline" size="sm" className="w-full">Manage Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
