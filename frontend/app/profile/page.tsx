"use client";

import { useUserProfile } from "../../hooks/useUserProfile";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { ProfileCard } from "../../components/profile/ProfileCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";

export default function ProfilePage() {
  const { profile, loading, isAuthenticated } = useUserProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-[#FAF8F3]">
        <Card className="w-full max-w-2xl mx-auto shadow-md">
          <CardHeader className="bg-[#FAF8F3] rounded-t-xl pb-10 flex flex-col items-center space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-[#FAF8F3]">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Not Authenticated</AlertTitle>
          <AlertDescription>You must be logged in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4 bg-[#FAF8F3]">
        <ProfileCard profile={profile} />
      </div>
    </ProtectedRoute>
  );
}
