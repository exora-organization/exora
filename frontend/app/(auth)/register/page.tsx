"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import Turnstile from "react-turnstile";
import { LogIn, Eye, EyeOff, ArrowRight, User, Mail, Lock } from "lucide-react";
import logoImg from "../../../public/logo.png";

import { signUp } from "../../../lib/firebase/auth";
import { apiAuth } from "../../../lib/api/auth";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  terms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const redirectPath = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("redirect") : null;
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", color: "bg-gray-200", width: "w-0" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (score < 5) return { label: "Medium", color: "bg-yellow-500", width: "w-2/3" };
    return { label: "Strong", color: "bg-[#0a9b5c]", width: "w-full" };
  };

  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signUp(data.email, data.password);
      
      const token = await userCredential.user.getIdToken();
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;
      
      await apiAuth.register(data.displayName, turnstileToken || undefined);
      
      const verifyUrl = redirectPath 
        ? `/verify-email?redirect=${encodeURIComponent(redirectPath)}`
        : "/verify-email";
      router.push(verifyUrl);
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10 pt-8">
        <div className="flex items-center space-x-2 mb-8">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-gray-800 tracking-tight text-lg leading-tight">EXORA - Export Feasibility & Decision Support Platform</h1>
        </div>

        <div className="mb-8">
          <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3">Registration Portal</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Get Started</h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Configure your institutional profile to access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs font-bold text-gray-700 tracking-widest uppercase">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <Input
                id="displayName"
                placeholder="John Doe"
                className="pl-10 h-12 bg-[#eef3f7] border-transparent focus:bg-white text-gray-900 placeholder:text-gray-400 text-base rounded-lg"
                {...register("displayName")}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-gray-700 tracking-widest uppercase">Corporate Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                className="pl-10 h-12 bg-[#eef3f7] border-transparent focus:bg-white text-gray-900 placeholder:text-gray-400 text-base rounded-lg"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-gray-700 tracking-widest uppercase">Secure Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="pl-10 pr-10 h-12 bg-[#eef3f7] border-transparent focus:bg-white text-gray-900 placeholder:text-gray-400 text-base rounded-lg"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordValue && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}
                  />
                </div>
                <p className={`text-xs text-right font-medium ${strength.label === "Weak" ? "text-red-500" : strength.label === "Medium" ? "text-yellow-600" : "text-[#0a9b5c]"}`}>
                  {strength.label}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-4 h-4 rounded border-gray-300 text-[#0a9b5c] focus:ring-[#0a9b5c]"
              {...register("terms")}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 font-medium cursor-pointer">
              I agree to the <span className="text-blue-600 hover:underline">Terms of Service</span> and <span className="text-blue-600 hover:underline">Privacy Policy</span>.
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500 mt-1">{errors.terms.message}</p>
          )}

          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div className="flex justify-center my-4">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#0a9b5c] hover:bg-[#08824d] text-white font-bold rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-colors" 
            disabled={isLoading || !turnstileToken}
          >
            <span>{isLoading ? "CREATING..." : "CREATE CORPORATE ACCOUNT"}</span>
            {!isLoading && <ArrowRight size={18} />}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-6 w-full">
          <div className="text-gray-500 text-xs">
            Already have an account?
          </div>
          <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="text-xs font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            Log in to portal
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
