"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiExportCase } from "../../lib/api/export-case";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Icon } from "@iconify/react";
import { ExportCaseResponse } from "../../lib/types/export-case";
import { useUserProfile } from "../../hooks/useUserProfile";

const formSchema = z.object({
  name: z.string().transform(val => val.trim()).pipe(z.string().min(2, "Name must be at least 2 characters").max(200)),
  product: z.string().transform(val => val.trim()).pipe(z.string().min(2, "Product must be at least 2 characters").max(200)),
  destinationCountry: z.string().transform(val => val.trim()).pipe(z.string().min(2, "Destination country must be at least 2 characters").max(100)),
  status: z.enum(["draft", "in_review", "finalized"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExportCaseFormProps {
  initialData?: ExportCaseResponse;
  isEdit?: boolean;
}

export function ExportCaseForm({ initialData, isEdit = false }: ExportCaseFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { profile } = useUserProfile();

  const isReadOnly = profile?.role !== "export_manager" && profile?.role !== "admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      product: initialData?.product || "",
      destinationCountry: initialData?.destinationCountry || "",
      status: (initialData?.status as any) || "draft",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (isEdit && initialData) {
        return apiExportCase.update(initialData.caseId, {
          name: data.name,
          product: data.product,
          destinationCountry: data.destinationCountry,
          status: data.status,
        });
      } else {
        return apiExportCase.create({
          name: data.name,
          product: data.product,
          destinationCountry: data.destinationCountry,
        });
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["export-cases"] });
      if (isEdit && initialData) {
        queryClient.invalidateQueries({ queryKey: ["export-case", initialData.caseId] });
      }
      router.push(`/export-case/${res.data?.caseId || initialData?.caseId}`);
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "An error occurred while saving the export case.");
    }
  });

  const onSubmit = (data: FormValues) => {
    setErrorMsg(null);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Case Name</Label>
          <Input
            id="name"
            placeholder="e.g. Coffee Beans to Japan 2026"
            disabled={isReadOnly}
            className="w-full pl-4 pr-4 py-3 h-12 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] bg-white text-sm font-medium transition-all"
            {...register("name")}
          />
          {errors.name && <p className="text-xs font-bold text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product" className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Product</Label>
          <Input
            id="product"
            placeholder="e.g. Arabica Coffee Beans"
            disabled={isReadOnly}
            className="w-full pl-4 pr-4 py-3 h-12 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] bg-white text-sm font-medium transition-all"
            {...register("product")}
          />
          {errors.product && <p className="text-xs font-bold text-red-500 mt-1">{errors.product.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinationCountry" className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Destination Country</Label>
          <Input
            id="destinationCountry"
            placeholder="e.g. Japan"
            disabled={isReadOnly}
            className="w-full pl-4 pr-4 py-3 h-12 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] bg-white text-sm font-medium transition-all"
            {...register("destinationCountry")}
          />
          {errors.destinationCountry && <p className="text-xs font-bold text-red-500 mt-1">{errors.destinationCountry.message}</p>}
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Status</Label>
            <select
              id="status"
              className="w-full px-4 py-3 h-12 rounded-2xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-[#00A651] bg-white text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-50"
              disabled={isReadOnly}
              {...register("status")}
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="finalized">Finalized</option>
            </select>
            {errors.status && <p className="text-xs font-bold text-red-500 mt-1">{errors.status.message}</p>}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 text-sm font-semibold bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
             <Icon icon="solar:danger-circle-bold-duotone" className="w-5 h-5 shrink-0" />
             {errorMsg}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="h-12 px-6 rounded-full border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
        >
          {isReadOnly ? "Back" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="h-12 px-8 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold shadow-md shadow-[#00A651]/20 transition-all"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Update Case" : "Create Case"}
          </Button>
        )}
      </div>
    </form>
  );
}
