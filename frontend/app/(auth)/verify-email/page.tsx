"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../../lib/firebase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    // Polling mechanism to check if email is verified
    const checkVerification = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push(redirectPath);
        }
      }
    };

    const interval = setInterval(checkVerification, 3000); // Poll every 3 seconds

    // Initial check in case they're already verified
    checkVerification();

    return () => clearInterval(interval);
  }, [router, redirectPath]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      setIsResending(true);
      setResendMessage(null);
      try {
        await sendEmailVerification(user);
        setResendMessage("Verification email resent. Please check your inbox.");
      } catch (error: any) {
        console.error("Error resending email:", error);
        setResendMessage("Failed to resend email. Please try again later.");
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Verify your Email</CardTitle>
        <CardDescription>We've sent a verification link to your email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Please check your email and click the verification link to activate your account.
          Once verified, you will be redirected automatically.
        </p>

        {resendMessage && (
          <div className="p-3 text-sm bg-blue-50 text-blue-600 rounded-md">
            {resendMessage}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          variant="default" 
          className="w-full"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? "Resending..." : "Resend Verification Email"}
        </Button>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
