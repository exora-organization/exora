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
import { useUserProfile } from "../../../../hooks/useUserProfile";

export default function ExportCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useUserProfile();
  const caseId = params.caseId as string;
  
  const canDelete = profile?.role === "export_manager" || profile?.role === "admin";

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

        {canDelete && (
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
        )}
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

          <h3 className="text-xl font-semibold mt-8 mb-4">Export Analysis Pipeline</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href={`/export-case/${caseId}/costing`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">1. Costing</h4>
                    <p className="text-xs text-gray-500 mt-1">Input direct and indirect costs to calculate total expenses.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/pricing`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">2. Pricing & Incoterms</h4>
                    <p className="text-xs text-gray-500 mt-1">Select Incoterms and calculate your export pricing strategy.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/financial`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">3. Financial Analysis</h4>
                    <p className="text-xs text-gray-500 mt-1">Review profitability margins and break-even points.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/scenario`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">4. Scenario Analysis</h4>
                    <p className="text-xs text-gray-500 mt-1">Simulate what-if financial scenarios for the export.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/risk`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">5. Risk Assessment</h4>
                    <p className="text-xs text-gray-500 mt-1">Evaluate market, operational, and financial risks.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/feasibility`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">6. Feasibility Score</h4>
                    <p className="text-xs text-gray-500 mt-1">View the overall quantitative feasibility score.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/advisor`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-indigo-700">7. AI Recommendation</h4>
                    <p className="text-xs text-gray-500 mt-1">Get strategic AI advice based on your case data.</p>
                  </div>
                  <div className="text-indigo-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/export-case/${caseId}/documents`}>
              <Card className="hover:bg-gray-50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-semibold text-slate-800">8. Document Generation</h4>
                    <p className="text-xs text-gray-500 mt-1">Generate and download essential export documents.</p>
                  </div>
                  <div className="text-slate-400 self-end mt-2">&rarr;</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            {profile?.role === "export_manager" || profile?.role === "admin" ? "Edit Configuration" : "Configuration Details"}
          </h3>
          <ExportCaseForm initialData={exportCase} isEdit={true} />
        </div>
      </div>
    </div>
  );
}
