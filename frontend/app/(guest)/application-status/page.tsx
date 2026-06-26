"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiCompany } from "../../../lib/api/company";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CompanyApplicationForm } from "../../../components/forms/CompanyApplicationForm";

export default function ApplicationStatusPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["application-status"],
    queryFn: () => apiCompany.getApplicationStatus(),
  });

  if (isLoading) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6 pb-6">
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-500 mt-4">Checking your application status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6 pb-6">
          <p className="text-red-500">Failed to load application status.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const appData = data?.data;

  // If there's no application data, user might not have applied yet
  if (!appData) {
    return (
      <Card className="text-center">
        <CardContent className="pt-6 pb-6">
          <p className="text-gray-500 mb-4">No active application found.</p>
          <Button onClick={() => router.push("/company-application")}>
            Apply Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  switch (appData.status) {
    case "pending":
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Application Pending</CardTitle>
            <CardDescription>Your application is currently under review by our admin team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
              <p>We will notify you once your application has been processed.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => refetch()} variant="outline">Refresh Status</Button>
          </CardFooter>
        </Card>
      );

    case "approved":
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-green-600">Application Approved!</CardTitle>
            <CardDescription>Congratulations, your company has been approved.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You now have full access to EXORA as a Company Owner. 
              Click below to proceed to your new dashboard.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push("/owner-dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      );

    case "rejected":
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Application Rejected</CardTitle>
            <CardDescription>Unfortunately, your application was not approved.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please contact support if you believe this was a mistake or if you need further clarification.
            </p>
          </CardContent>
        </Card>
      );

    case "revision_requested":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-600">Revision Requested</CardTitle>
              <CardDescription>Please review the admin's feedback and resubmit your application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <p className="font-semibold mb-1">Admin Notes:</p>
                <p>{appData.revisionNotes || "No notes provided."}</p>
              </div>
            </CardContent>
          </Card>
          
          <CompanyApplicationForm 
            isRevision={true}
            initialData={{
              companyName: appData.companyName,
              businessSector: appData.businessSector,
              country: appData.country,
            }}
            onSuccess={() => refetch()}
          />
        </div>
      );

    default:
      return null;
  }
}
