"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import Turnstile from "react-turnstile";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Globe } from "lucide-react";
import logoImg from "../../../public/logo.png";

import { signIn } from "../../../lib/firebase/auth";
import { apiAuth } from "../../../lib/api/auth";
import { apiUsers } from "../../../lib/api/users";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  useEffect(() => {
    setRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
  }, []);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      const role = profileRes.data?.role;
      
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        if (role === "guest") {
          const companyId = profileRes.data?.companyId;
          const status = profileRes.data?.companyStatus;
          if (companyId || status) {
            router.push("/application-status");
          } else {
            router.push("/company-application");
          }
        } else if (role === "admin") {
          router.push("/admin-dashboard");
        } else if (role === "company_owner") {
          router.push("/owner-dashboard");
        } else if (role === "export_manager") {
          router.push("/export-manager-dashboard");
        } else if (role === "finance_staff") {
          router.push("/finance-dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-8 sm:p-10 pt-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F5F8F6] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Corporate Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="manager@wacanatech.com"
                className="pl-10 h-12 bg-[#F5F8F6] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-base rounded-lg"
                {...register("email")}
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
                placeholder="password123"
                className="pl-10 pr-10 h-12 bg-[#F5F8F6] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-base rounded-lg"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none"
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

          <div className="flex justify-center my-2">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 bg-gradient-to-r from-[#2F6B4F] to-[#25563F] hover:from-[#25563F] hover:to-[#25563F] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 transition-all duration-300 mt-4" 
            disabled={isLoading || !turnstileToken}
          >
            <span>{isLoading ? "SIGNING IN..." : "LOG IN TO FEASIBILITY SUITE"}</span>
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 w-full pt-4 border-t border-[#E8E3D9]">
          <div className="text-[#9CA3AF] text-xs font-medium">
            New to EXORA?
          </div>
          <Link href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="px-4 py-2 rounded-lg bg-[#F5F8F6] hover:bg-gray-200 text-[#1F2937] text-xs font-bold transition-colors">
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-white/60 hover:bg-white border border-white/50 shadow-sm text-sm text-[#4B5563] font-bold transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
