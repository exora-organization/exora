"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiExportCase } from "../../../lib/api/export-case";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export default function ExportCaseListPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["export-cases"],
    queryFn: () => apiExportCase.list(),
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load export cases.</p>
        <Button onClick={() => refetch()} variant="outline">Retry</Button>
      </div>
    );
  }

  const cases = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Export Cases</h2>
          <p className="text-[#9CA3AF] mt-1">Manage your company's export plans</p>
        </div>
        <Link href="/export-case/new">
          <Button>Create New Case</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Export Cases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Name</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Feasibility</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="text-[#9CA3AF]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-[#1F2937]">No Export Cases Found</p>
                    <p className="text-sm text-[#9CA3AF] max-w-sm text-center">
                      Get started by creating a new export case to begin feasibility and pricing analysis.
                    </p>
                    <Link href="/export-case/new">
                      <Button variant="outline" className="mt-2">Create New Case</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow key={c.caseId}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.destinationCountry}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "finalized" ? "secondary" : c.status === "in_review" ? "default" : "outline"}>
                      {c.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.feasibilityScore !== undefined && c.feasibilityScore !== null 
                      ? `${c.feasibilityScore.toFixed(1)} / 10` 
                      : "Not analyzed"}
                  </TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/export-case/${c.caseId}`}>
                      <Button variant="outline" size="sm">Manage</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
    </div>
  );
}
