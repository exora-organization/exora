"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Globe } from "lucide-react";
import logoImg from "../../../public/logo.png";

import { signIn } from "../../../lib/firebase/auth";
import { apiAuth } from "../../../lib/api/auth";
import { apiUsers } from "../../../lib/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { isRouteAllowed } from "../../../lib/route-guard";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const redirectPath = searchParams.get("redirect") || null;

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const renderRecaptcha = () => {
    if (typeof window !== "undefined" && (window as any).grecaptcha && (window as any).grecaptcha.render) {
      const container = document.getElementById("recaptcha-container");
      if (container && container.childElementCount === 0) {
        try {
          (window as any).grecaptcha.render("recaptcha-container", {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: "onRecaptchaVerify",
            "expired-callback": "onRecaptchaExpired",
          });
        } catch (e) {
          console.error("grecaptcha render error:", e);
        }
      }
    }
  };

  useEffect(() => {
    (window as any).onRecaptchaVerify = (token: string) => {
      setRecaptchaToken(token);
    };
    (window as any).onRecaptchaExpired = () => {
      setRecaptchaToken(null);
    };

    let interval: NodeJS.Timeout;
    const checkAndRender = () => {
      if (typeof window !== "undefined" && (window as any).grecaptcha && (window as any).grecaptcha.render) {
        renderRecaptcha();
        clearInterval(interval);
      }
    };

    interval = setInterval(checkAndRender, 100);
    checkAndRender();

    return () => {
      clearInterval(interval);
      delete (window as any).onRecaptchaVerify;
      delete (window as any).onRecaptchaExpired;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signIn(data.email, data.password);
      const token = await userCredential.user.getIdToken();
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;

      await apiAuth.login();
      const profileRes = await apiUsers.getCurrentUser();
      queryClient.setQueryData(["user-profile", userCredential.user.uid], profileRes);
      const role = profileRes.data?.role;

      let targetPath = "/";
      if (role === "guest") {
        const companyId = profileRes.data?.companyId;
        const status = profileRes.data?.companyStatus;
        if (companyId || status) {
          targetPath = "/guest-application-status";
        } else {
          targetPath = "/guest-company-application";
        }
      } else if (role === "admin") {
        targetPath = "/admin-dashboard";
      } else if (role === "company_owner") {
        targetPath = "/own-dashboard";
      } else if (role === "export_manager") {
        targetPath = "/em-dashboard";
      } else if (role === "finance_staff") {
        targetPath = "/fs-dashboard";
      }

      const finalPath = redirectPath && isRouteAllowed(redirectPath, role || null)
        ? redirectPath
        : targetPath;

      if (!userCredential.user.emailVerified) {
        router.push(`/verify-email?redirect=${encodeURIComponent(finalPath)}`);
      } else {
        router.push(finalPath);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="group bg-white/95 backdrop-blur-xl border border-white/60 p-8 sm:p-10 pt-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-center justify-center space-x-3 mb-6 text-center">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1F2937] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-1 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-[#9CA3AF]">Please log in to your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Corporate Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                className="pl-10 h-12 bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/20 hover:bg-[#E3F4EC] hover:border-[#00A651]/40 shadow-sm text-[#1F2937] placeholder:text-[#80988E] text-base rounded-lg transition-all"
                {...register("email")}
                suppressHydrationWarning
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Secure Password</Label>
              <Link href="/reset-password" className="text-xs font-bold text-[#1F2937] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className="pl-10 pr-10 h-12 bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/20 hover:bg-[#E3F4EC] hover:border-[#00A651]/40 shadow-sm text-[#1F2937] placeholder:text-[#80988E] text-base rounded-lg transition-all"
                {...register("password")}
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none cursor-pointer"
                suppressHydrationWarning
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* Load Google reCAPTCHA v2 Script */}
          <Script
            src="https://www.google.com/recaptcha/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={renderRecaptcha}
          />

          <div className="flex justify-center my-4">
            <div id="recaptcha-container"></div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 transition-all duration-300 mt-4 cursor-pointer"
            disabled={isLoading || !recaptchaToken}
            suppressHydrationWarning
          >
            <span>{isLoading ? "SIGNING IN..." : "LOG IN TO FEASIBILITY SUITE"}</span>
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 w-full pt-4 border-t border-[#E8E3D9]">
          <div className="text-[#9CA3AF] text-xs font-medium">
            New to EXORA?
          </div>
          <Link href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="px-5 py-2.5 rounded-xl bg-white border border-[#00A651] text-[#00A651] hover:bg-[#00A651] hover:text-white text-xs font-extrabold uppercase tracking-wide shadow-sm hover:shadow-md transition-all">
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-white hover:bg-[#F3F4F6] border border-[#E8E3D9] shadow-md hover:shadow-lg text-sm text-[#1F2937] font-extrabold transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
