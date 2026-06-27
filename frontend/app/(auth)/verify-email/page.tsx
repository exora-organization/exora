"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Verify your Email</CardTitle>
        <CardDescription>We've sent a verification link to your email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Please check your email and click the verification link to activate your account.
          Once verified, you can proceed to submit your company application.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
