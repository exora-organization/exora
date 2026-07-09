"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("EXORA Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] bg-gradient-to-br from-[#FAF8F3] via-[#FAF8F3] to-[#F5F8F6] flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-red-100/30 blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#2F6B4F]/5 blur-3xl -z-10"></div>

      <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
        
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[#1F2937] mb-3">
          Something Went Wrong
        </h1>
        
        <p className="text-[#9CA3AF] text-sm leading-relaxed mb-8 max-w-md mx-auto">
          An unexpected error occurred while loading this page. EXORA Feasibility Suite has halted to protect your active session data.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3.5 mb-8">
          <Button
            onClick={() => reset()}
            className="bg-gradient-to-r from-[#2F6B4F] to-[#25563F] hover:from-[#25563F] hover:to-[#25563F] text-white font-bold h-12 px-6 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full bg-[#F5F8F6] border-[#E8E3D9] text-[#1F2937] hover:bg-gray-100 font-bold h-12 px-6 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </div>

        {/* Collapsable Technical Error Details */}
        <div className="border-t border-[#E8E3D9]/60 pt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mx-auto flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-widest cursor-pointer focus:outline-none transition-colors"
          >
            <span>{showDetails ? "Hide Technical Details" : "Show Technical Details"}</span>
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-4 text-left bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto text-xs font-mono text-slate-700 leading-relaxed scrollbar-thin">
              <p className="font-bold text-red-600 mb-1">Error Digest/Message:</p>
              <p className="mb-3 break-all">{error?.message || "No error message provided."}</p>
              {error?.digest && (
                <>
                  <p className="font-bold text-gray-600 mb-1">Error Digest:</p>
                  <p className="break-all">{error.digest}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
