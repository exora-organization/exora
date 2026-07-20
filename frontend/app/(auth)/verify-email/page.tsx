"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendEmailVerification } from "firebase/auth";
import Image from "next/image";
import logoImg from "../../../public/logo.png";
import { auth } from "../../../lib/firebase/client";
import { Button } from "../../../components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/company-application";

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    // Polling mechanism to check if email is verified
    const checkVerification = async () => {
      const user = auth.currentUser;
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          const token = await user.getIdToken(true);
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;
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
    <div className="w-full">
      <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
        
        <div className="flex items-center justify-center space-x-3 mb-6 text-center relative z-10">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1F2937] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>

        <div className="mb-6 relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] mb-2">Verify your Email</h2>
          <p className="text-sm text-[#9CA3AF]">We've sent a verification link to your email.</p>
        </div>
        
        <div className="space-y-4 relative z-10 mb-8">
          <p className="text-sm text-[#4B5563]">
            Please check your email and click the verification link to activate your account.
            Once verified, you will be redirected automatically.
          </p>

          {resendMessage && (
            <div className="p-3 text-sm bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              {resendMessage}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3 relative z-10">
          <Button 
            className="w-full h-12 bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "RESENDING..." : "RESEND VERIFICATION EMAIL"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-[#E8E3D9] text-[#4B5563] font-bold hover:bg-[#EBF8F2] transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            GO TO LOGIN
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
