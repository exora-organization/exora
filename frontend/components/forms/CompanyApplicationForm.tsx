"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      businessSector: initialData?.businessSector || "",
      country: initialData?.country || "",
    },
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CompanyApplicationRequest = {
        companyName: data.companyName,
        businessSector: data.businessSector,
        country: data.country,
      };

      await apiCompany.apply(payload);
      
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
    <Card>
      <CardHeader>
        <CardTitle>{isRevision ? "Revise Application" : "Company Application"}</CardTitle>
        <CardDescription>
          {isRevision 
            ? "Please update your company details based on the admin's feedback." 
            : "Submit your company details to get started with EXORA."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="e.g. PT Jaya Abadi"
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessSector">Business Sector</Label>
            <Input
              id="businessSector"
              placeholder="e.g. Agriculture, Manufacturing"
              {...register("businessSector")}
            />
            {errors.businessSector && (
              <p className="text-sm text-red-500">{errors.businessSector.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g. Indonesia"
              {...register("country")}
            />
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>
          
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : (isRevision ? "Resubmit Application" : "Submit Application")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
