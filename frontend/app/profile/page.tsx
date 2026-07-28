"use client";

import { useUserProfile } from "../../hooks/useUserProfile";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { ArrowLeft, User, Shield, Building, Clock, Mail, LogOut, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, resetPassword } from "../../lib/firebase/auth";
import { apiAuth } from "../../lib/api/auth";

export default function ProfilePage() {
  const { profile, loading, isAuthenticated } = useUserProfile();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-4">
        <Alert variant="destructive" className="max-w-md shadow-xl rounded-2xl">
          <AlertTitle className="font-bold">Not Authenticated</AlertTitle>
          <AlertDescription>You must be logged in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatRole = (r: string) => (r || "").split("_").map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : "").join(" ");
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };
  const capitalize = (s?: string | null) => {
    if (!s) return "Not Available";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      await apiAuth.logout().catch(() => {});
      queryClient.clear();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleResetPassword = async () => {
    if (!profile.email) return;
    setIsResetting(true);
    try {
      await resetPassword(profile.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      console.error("Failed to send reset email", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="rounded-full w-12 h-12 p-0 border-white/60 bg-white/90 shadow-md hover:bg-[#EBF8F2] hover:text-[#00A651] hover:border-[#00A651]/30 transition-all group shrink-0"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F2937]">Your Profile</h2>
              <p className="text-sm sm:text-base text-[#4B5563] mt-1 font-medium">Manage your personal account details.</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#EBF8F2] to-white px-6 sm:px-8 py-8 flex flex-col items-center text-center relative">
            <div className="static sm:absolute sm:top-5 sm:right-5 mb-4 sm:mb-0">
              <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-sm text-[10px] font-bold text-[#00A651] uppercase tracking-widest border border-white">
                <Shield className="w-3.5 h-3.5" />
                {formatRole(profile.role)}
              </span>
            </div>
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#00A651] rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-lg border-[3px] border-white mb-3 shrink-0">
              {profile.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] mb-1.5">{profile.displayName || "Unknown User"}</h3>
            <div className="text-xs sm:text-sm text-[#4B5563] font-medium flex items-center justify-center gap-2 bg-white/50 px-3 py-1 rounded-full shadow-sm max-w-full">
              <Mail className="w-3.5 h-3.5 text-[#00A651] shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-white">
            <div className="flex gap-3 p-4 rounded-xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Account Status</p>
                <p className="text-base font-extrabold text-[#1F2937]">{capitalize(profile.status)}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Company Status</p>
                <p className="text-base font-extrabold text-[#1F2937]">{capitalize(profile.companyStatus)}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Company ID</p>
                <p className="text-base font-extrabold text-[#1F2937] font-mono truncate max-w-[150px] sm:max-w-[180px]">{profile.companyId || "Not Available"}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-0.5">Member Since</p>
                <p className="text-base font-extrabold text-[#1F2937]">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 sm:p-6 pt-0 bg-white flex flex-col sm:flex-row gap-3 border-t border-[#E8E3D9]/50 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-11 font-bold border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm text-sm"
              onClick={handleResetPassword}
              disabled={isResetting || resetSent}
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {resetSent ? "Reset Email Sent!" : "Reset Password"}
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1 rounded-xl h-11 font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-md uppercase tracking-wider text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
