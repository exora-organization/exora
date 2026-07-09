"use client";

import Link from "next/link";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useUserProfile } from "../../hooks/useUserProfile";
import { signOut } from "../../lib/firebase/auth";

export default function ForbiddenPage() {
  const { profile } = useUserProfile();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] bg-gradient-to-br from-[#FAF8F3] via-[#FAF8F3] to-[#F5F8F6] flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-amber-100/30 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#2F6B4F]/5 blur-3xl -z-10"></div>

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
        
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937] mb-3">
          403 - Access Denied
        </h1>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          You do not have permission to access this portal page. 
          {profile?.role && (
            <span> Your current authenticated role is <span className="font-bold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border text-xs">{profile.role.replace("_", " ").toUpperCase()}</span>.</span>
          )}
        </p>

        <p className="text-xs text-[#9CA3AF] mb-8 max-w-xs mx-auto">
          Please contact system administration if you believe this is in error.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-4 border-t border-[#E8E3D9]/60">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full bg-gradient-to-r from-[#2F6B4F] to-[#25563F] hover:from-[#25563F] hover:to-[#25563F] text-white font-bold h-12 px-6 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full sm:w-auto bg-[#F5F8F6] border-[#E8E3D9] text-[#1F2937] hover:bg-gray-100 font-bold h-12 px-6 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
}
