"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { resetPassword } from "../../../lib/firebase/auth";
import logoImg from "../../../public/logo.png";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
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
          <h2 className="text-2xl font-bold text-[#1F2937] mb-1 tracking-tight">Reset Password</h2>
          <p className="text-sm text-[#9CA3AF]">Enter your email to receive recovery instructions.</p>
        </div>

        {success ? (
          <div className="p-6 bg-green-50/80 border border-green-100 rounded-xl text-center space-y-4 shadow-sm mb-6">
            <div className="text-green-700 font-extrabold tracking-tight text-lg">Check your email</div>
            <p className="text-sm text-green-600 font-medium">
              We've sent a password reset link to your email address. Please check your inbox and spam folder.
            </p>
          </div>
        ) : (
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
                  placeholder="manager@company.com"
                  className="pl-10 h-12 bg-[#F5F8F6] border-transparent focus:bg-white text-[#1F2937] placeholder:text-[#9CA3AF] text-base rounded-lg"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-600 rounded-md border border-red-100">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-[#2F6B4F] to-[#25563F] hover:from-[#25563F] hover:to-[#25563F] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2 transition-all duration-300 mt-4 group" 
              disabled={isLoading}
            >
              <span>{isLoading ? "SENDING LINK..." : "SEND RESET LINK"}</span>
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        )}

        <div className="flex flex-col items-center justify-center mt-6 w-full pt-4 border-t border-[#E8E3D9]">
          <Link href="/login" className="px-4 py-2 rounded-lg bg-[#F5F8F6] hover:bg-gray-200 text-[#1F2937] text-xs font-bold transition-colors w-full text-center">
            Remember your password? Log in here
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
