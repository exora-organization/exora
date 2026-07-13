"use client";

import { useState, Suspense, useEffect } from "react";
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
    return { label: "Strong", color: "bg-[#00A651]", width: "w-full" };
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
      <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-6 sm:p-8 pt-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-center justify-center space-x-3 mb-4 text-center">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1F2937] tracking-tight text-2xl leading-tight">EXORA</h1>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-1 tracking-tight">Get Started</h2>
          <p className="text-sm text-[#9CA3AF]">Create your account to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <User size={18} />
              </div>
              <Input
                id="displayName"
                placeholder="John Doe"
                className="pl-10 h-10 bg-[#EBF8F2] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm rounded-lg"
                {...register("displayName")}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Corporate Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <Mail size={18} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                className="pl-10 h-10 bg-[#EBF8F2] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm rounded-lg"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-[#4B5563] tracking-widest uppercase">Secure Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
                <Lock size={18} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="pl-10 pr-10 h-10 bg-[#EBF8F2] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-sm rounded-lg"
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
            {passwordValue && (
              <div className="mt-2 bg-[#EBF8F2] rounded-xl p-3 border border-[#E8E3D9]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#9CA3AF] tracking-widest uppercase">Strength:</span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase ${strength.label === "Weak" ? "text-[#F43F5E]" : strength.label === "Medium" ? "text-yellow-500" : "text-[#00A651]"}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.label === "Weak" ? "bg-[#F43F5E]" : strength.color} ${strength.width}`}
                  />
                </div>
                {(() => {
                  const missing = [];
                  if (passwordValue.length < 8) missing.push("At least 8 characters");
                  if (!/[A-Z]/.test(passwordValue)) missing.push("One uppercase letter");
                  if (!/[a-z]/.test(passwordValue)) missing.push("One lowercase letter");
                  if (!/[0-9]/.test(passwordValue)) missing.push("One number");
                  if (!/[^A-Za-z0-9]/.test(passwordValue)) missing.push("One special character");
                  
                  if (missing.length > 0) {
                    return (
                      <p className="text-[10px] text-[#9CA3AF] leading-tight font-medium">
                        Missing: {missing.join(", ")}
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-[10px] text-[#00A651] font-bold leading-tight">
                        ✓ All requirements met
                      </p>
                    );
                  }
                })()}
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
            <Label htmlFor="terms" className="text-sm text-[#4B5563] font-medium cursor-pointer">
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

          <div className="flex justify-center my-2">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
              onVerify={(token) => setTurnstileToken(token)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-10 bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 transition-all duration-300 group" 
            disabled={isLoading || !turnstileToken}
          >
            <span>{isLoading ? "CREATING..." : "CREATE ACCOUNT"}</span>
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-5 w-full pt-4 border-t border-[#E8E3D9]">
          <div className="text-[#9CA3AF] text-xs font-medium">
            Already have an account?
          </div>
          <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="px-5 py-2.5 rounded-xl bg-white border border-[#00A651] text-[#00A651] hover:bg-[#00A651] hover:text-white text-xs font-extrabold uppercase tracking-wide shadow-sm hover:shadow-md transition-all">
            Log in to portal
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

export default function RegisterPage() {
  return <RegisterForm />;
}
