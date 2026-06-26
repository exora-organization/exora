"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../../components/providers/AuthProvider";
import { apiOwner } from "../../../lib/api/owner";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export default function CompanyProfilePage() {
  const { profile } = useAuthContext();
  const companyId = profile?.companyId;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => apiOwner.getCompanyDetails(companyId as string),
    enabled: !!companyId,
  });

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load company profile.</p>
        <Button onClick={() => refetch()} variant="outline">Retry</Button>
      </div>
    );
  }

  const company = data.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
        <Badge variant="secondary" className="px-3 py-1">
          {company?.status?.toUpperCase() || "ACTIVE"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Company ID</p>
              <p className="font-medium text-sm font-mono">{company?.companyId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium text-lg">{company?.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Sector</p>
              <p className="font-medium">{company?.businessSector}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{company?.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
