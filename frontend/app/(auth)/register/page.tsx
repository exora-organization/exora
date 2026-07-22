"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
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

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      
      await apiAuth.register(data.displayName, recaptchaToken || undefined);
      
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
      <div className="group bg-white/95 backdrop-blur-xl border border-white/60 p-5 sm:p-6 pt-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="flex items-center justify-center space-x-2 mb-2 text-center">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="font-extrabold text-[#1F2937] tracking-tight text-xl leading-tight">EXORA</h1>
        </div>

        <div className="mb-3">
          <h2 className="text-xl font-bold text-[#1F2937] mb-0.5 tracking-tight">Get Started</h2>
          <p className="text-[13px] text-[#9CA3AF]">Create your account to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
          <div className="space-y-1.5">
            <Label htmlFor="displayName" className="text-[10px] font-bold text-[#4B5563] tracking-widest uppercase">Full Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#9CA3AF]">
                <User size={16} />
              </div>
              <Input
                id="displayName"
                placeholder="John Doe"
                className="pl-9 h-9 bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/20 hover:bg-[#E3F4EC] hover:border-[#00A651]/40 shadow-sm text-[#1F2937] placeholder:text-[#80988E] text-xs rounded-lg transition-all"
                {...register("displayName")}
              />
            </div>
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-bold text-[#4B5563] tracking-widest uppercase">Corporate Email Address</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#9CA3AF]">
                <Mail size={16} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com"
                className="pl-9 h-9 bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/20 hover:bg-[#E3F4EC] hover:border-[#00A651]/40 shadow-sm text-[#1F2937] placeholder:text-[#80988E] text-xs rounded-lg transition-all"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[10px] font-bold text-[#4B5563] tracking-widest uppercase">Secure Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#9CA3AF]">
                <Lock size={16} />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="pl-9 pr-9 h-9 bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:border-[#00A651] focus:ring-4 focus:ring-[#00A651]/20 hover:bg-[#E3F4EC] hover:border-[#00A651]/40 shadow-sm text-[#1F2937] placeholder:text-[#80988E] text-xs rounded-lg transition-all"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#9CA3AF] hover:text-[#4B5563] focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordValue && (
              <div className="mt-1.5 bg-[#EBF8F2] rounded-lg p-2 border border-[#E8E3D9]">
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

          <div className="flex items-center space-x-2 pt-1">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-3.5 h-3.5 rounded border-gray-300 text-[#0a9b5c] focus:ring-[#0a9b5c]"
              {...register("terms")}
            />
            <Label htmlFor="terms" className="text-xs text-[#4B5563] font-medium cursor-pointer">
              I agree to the <Link href="/terms-of-service" className="text-blue-600 hover:underline" target="_blank">Terms of Service</Link> and <Link href="/privacy-policy" className="text-blue-600 hover:underline" target="_blank">Privacy Policy</Link>.
            </Label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500 mt-1">{errors.terms.message}</p>
          )}

          {error && (
            <div className="p-2 text-xs bg-red-50 text-red-600 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* Load Google reCAPTCHA v2 Script */}
          <Script 
            src="https://www.google.com/recaptcha/api.js?render=explicit" 
            strategy="afterInteractive"
            onLoad={renderRecaptcha}
          />

          <div className="flex justify-center my-2 transform scale-95 origin-top">
            <div id="recaptcha-container"></div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-9 bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 transition-all duration-300 group text-[11px]" 
            disabled={isLoading || !recaptchaToken}
          >
            <span>{isLoading ? "CREATING..." : "CREATE ACCOUNT"}</span>
            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-4 w-full pt-3 border-t border-[#E8E3D9]">
          <div className="text-[#9CA3AF] text-[10px] font-medium uppercase tracking-wider">
            Have an account?
          </div>
          <Link href={`/login${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="px-4 py-2 rounded-lg bg-white border border-[#00A651] text-[#00A651] hover:bg-[#00A651] hover:text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm hover:shadow-md transition-all">
            Log in to portal
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="inline-flex items-center justify-center px-6 py-2 rounded-xl bg-white hover:bg-[#F3F4F6] border border-[#E8E3D9] shadow-sm hover:shadow-md text-xs text-[#1F2937] font-extrabold transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A651]"></div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
