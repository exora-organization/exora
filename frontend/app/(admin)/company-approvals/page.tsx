"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiAdmin } from "../../../lib/api/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function CompanyApprovalsPage() {
  const { firebaseUser, loading: authLoading } = useUserProfile();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => apiAdmin.getCompanyApplications(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load applications.</p>
        <Button onClick={() => refetch()} variant="outline">Retry</Button>
      </div>
    );
  }

  const applications = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Company Approvals</h2>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.companyId}>
                  <TableCell className="font-medium">{app.companyName}</TableCell>
                  <TableCell>{app.businessSector}</TableCell>
                  <TableCell>{app.country}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === "pending" ? "default" : app.status === "approved" ? "secondary" : "destructive"}>
                      {app.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/company-approvals/${app.companyId}`}>
                      <Button variant="outline" size="sm">Review</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
