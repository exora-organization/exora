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

      <div className="border border-[#E8E3D9] rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FAF8F3]/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Company Name</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Sector</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Country</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Status</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Date</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-[#9CA3AF] font-medium">
                  No applications found.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.companyId} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-[#1F2937]">{app.companyName}</TableCell>
                  <TableCell className="px-6 py-4 text-[#4B5563]">{app.businessSector}</TableCell>
                  <TableCell className="px-6 py-4 text-[#4B5563]">{app.country}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={app.status === "pending" ? "default" : app.status === "approved" ? "secondary" : "destructive"} className="font-bold tracking-wide">
                      {app.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[#9CA3AF] text-sm font-medium">{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Link href={`/company-approvals/${app.companyId}`}>
                      <Button variant="outline" size="sm" className="font-bold text-[#0a9b5c] border-[#0a9b5c]/30 hover:bg-[#2F6B4F] hover:text-white transition-colors">
                        Review
                      </Button>
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
