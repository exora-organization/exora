"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiCompany } from "../../lib/api/company";
import { CompanyApplicationRequest } from "../../lib/types/company";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const applicationSchema = z.object({
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters"),
  businessSector: z.string().trim().min(2, "Business sector is required"),
  country: z.string().trim().min(2, "Country is required"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface CompanyApplicationFormProps {
  initialData?: Partial<ApplicationFormValues>;
  onSuccess?: () => void;
  isRevision?: boolean;
}

export function CompanyApplicationForm({ initialData, onSuccess, isRevision = false }: CompanyApplicationFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      businessSector: initialData?.businessSector || "",
      country: initialData?.country || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        companyName: initialData.companyName || "",
        businessSector: initialData.businessSector || "",
        country: initialData.country || "",
      });
    }
  }, [initialData, reset]);

  const currentCountry = watch("country") || "";
  const supportedCountries = [
    "singapore", "malaysia", "thailand", "vietnam", "china", 
    "india", "japan", "south korea", "united states", "united arab emirates", "uae", "united arab emirates (uae)"
  ];
  const normalizedCountry = currentCountry.trim().toLowerCase();
  const showCountryWarning = normalizedCountry !== "" && !supportedCountries.includes(normalizedCountry);

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Force refresh user to get the latest email verification status in the token claims
      const { auth } = await import("../../lib/firebase/client");
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await auth.currentUser.getIdToken(true);
      }

      const payload: CompanyApplicationRequest = {
        companyName: data.companyName,
        businessSector: data.businessSector,
        country: data.country,
      };

      await apiCompany.apply(payload);

      // Invalidate query cache to fetch the new pending status
      await queryClient.invalidateQueries({ queryKey: ["application-status"] });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-xs font-black text-gray-800 tracking-widest uppercase ml-4">Company Name</Label>
          <Input
            id="companyName"
            placeholder="e.g. PT Jaya Abadi"
            className="w-full px-6 py-4 h-14 rounded-full border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2] hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md shadow-sm text-[#1F2937] placeholder:text-[#80988E]"
            {...register("companyName")}
          />
          {errors.companyName && (
            <p className="text-sm text-red-500 font-bold ml-4">{errors.companyName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessSector" className="text-xs font-black text-gray-800 tracking-widest uppercase ml-4">Business Sector</Label>
          <Input
            id="businessSector"
            placeholder="e.g. Agriculture, Manufacturing"
            className="w-full px-6 py-4 h-14 rounded-full border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2] hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md shadow-sm text-[#1F2937] placeholder:text-[#80988E]"
            {...register("businessSector")}
          />
          {errors.businessSector && (
            <p className="text-sm text-red-500 font-bold ml-4">{errors.businessSector.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-xs font-black text-gray-800 tracking-widest uppercase ml-4">Country</Label>
          <Input
            id="country"
            placeholder="e.g. Indonesia, Singapore"
            className="w-full px-6 py-4 h-14 rounded-full border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2] hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md shadow-sm text-[#1F2937] placeholder:text-[#80988E]"
            {...register("country")}
          />
          {errors.country ? (
            <p className="text-sm text-red-500 font-bold ml-4">{errors.country.message}</p>
          ) : showCountryWarning ? (
            <div className="ml-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2.5 items-start shadow-sm">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed pr-2">
                AI Recommendation Advisor is currently available for selected countries only. Other Exora features remain available.
              </p>
            </div>
          ) : null}
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-[#0a9b5c] to-[#08824d] hover:from-[#08824d] hover:to-[#06683e] text-white font-extrabold tracking-widest uppercase rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : (isRevision ? "RESUBMIT APPLICATION" : "SUBMIT APPLICATION")}
          </Button>
        </div>
      </form>
    </div>
  );
}
