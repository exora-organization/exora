"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiExportCase } from "../../../../lib/api/export-case";
import { ExportCaseForm } from "../../../../components/export-case/ExportCaseForm";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";

export default function ExportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const caseId = params.caseId as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["export-case", caseId],
    queryFn: () => apiExportCase.get(caseId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiExportCase.delete(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["export-cases"] });
      router.push("/export-case");
    },
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (error || !data?.data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load export case details.</p>
        <Link href="/export-case">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>
    );
  }

  const exportCase = data.data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/export-case" className="text-sm text-blue-500 hover:underline mb-2 block">
            &larr; Back to Export Cases
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">{exportCase.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={exportCase.status === "finalized" ? "secondary" : exportCase.status === "in_review" ? "default" : "outline"}>
              {exportCase.status.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              Created {new Date(exportCase.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 rounded-md px-3 text-xs">
            Delete Case
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the export case "{exportCase.name}" and remove all associated data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  deleteMutation.mutate();
                }}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, delete case"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Case Overview</h3>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-medium text-lg">{exportCase.product}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination Country</p>
                <p className="font-medium text-lg">{exportCase.destinationCountry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Feasibility Score</p>
                <p className="font-medium text-lg">
                  {exportCase.feasibilityScore !== undefined && exportCase.feasibilityScore !== null 
                    ? `${exportCase.feasibilityScore.toFixed(1)} / 10` 
                    : "Not analyzed yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-xl font-semibold mt-8 mb-4">Next Steps</h3>
          <div className="grid gap-4">
            <Link href={`/export-case/${caseId}/costing`}>
              <Card className="hover:bg-gray-50 transition-colors border-blue-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">Costing Configuration</h4>
                    <p className="text-sm text-gray-500 mt-1">Input direct and indirect costs to calculate margins.</p>
                  </div>
                  <div className="text-blue-500">&rarr;</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Edit Configuration</h3>
          <ExportCaseForm initialData={exportCase} isEdit={true} />
        </div>
      </div>
    </div>
  );
}
