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
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  businessSector: z.string().min(2, "Business sector is required"),
  country: z.string().min(2, "Country is required"),
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
            placeholder="e.g. Indonesia"
            className="w-full px-6 py-4 h-14 rounded-full border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2] hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md shadow-sm text-[#1F2937] placeholder:text-[#80988E]"
            {...register("country")}
          />
          {errors.country && (
            <p className="text-sm text-red-500 font-bold ml-4">{errors.country.message}</p>
          )}
        </div>
        
        {error && (
          <div className="p-3 text-sm bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-[#0a9b5c] to-[#08824d] hover:from-[#08824d] hover:to-[#06683e] text-white font-extrabold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : (isRevision ? "RESUBMIT APPLICATION" : "SUBMIT APPLICATION")}
          </Button>
        </div>
      </form>
    </div>
  );
}
