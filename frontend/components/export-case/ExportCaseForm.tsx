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
      router.push(`/em-export-case/${res.data?.caseId || initialData?.caseId}`);
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
        <div className="space-y-1.5">
          <Label htmlFor="name" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Case Name</Label>
          <Input
            id="name"
            placeholder="e.g. Coffee Beans to Japan 2026"
            disabled={isReadOnly}
            className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold w-full"
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-red-500 font-bold ml-4">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="product" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Product</Label>
          <Input
            id="product"
            placeholder="e.g. Arabica Coffee Beans"
            disabled={isReadOnly}
            className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold w-full"
            {...register("product")}
          />
          {errors.product && <p className="text-sm text-red-500 font-bold ml-4">{errors.product.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="destinationCountry" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Destination Country</Label>
          <Input
            id="destinationCountry"
            placeholder="e.g. Japan"
            disabled={isReadOnly}
            className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold w-full"
            {...register("destinationCountry")}
          />
          {errors.destinationCountry && <p className="text-sm text-red-500 font-bold ml-4">{errors.destinationCountry.message}</p>}
        </div>

        {isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="status" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Status</Label>
            <select
              id="status"
              className="w-full bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1.5rem_center]"
              disabled={isReadOnly}
              {...register("status")}
            >
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="finalized">Finalized</option>
            </select>
            {errors.status && <p className="text-sm text-red-500 font-bold ml-4">{errors.status.message}</p>}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 text-sm font-semibold bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
             <Icon icon="solar:danger-circle-bold-duotone" className="w-5 h-5 shrink-0" />
             {errorMsg}
          </div>
        )}
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-8">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="rounded-full font-bold px-10 py-4 text-[#4B5563] border-2 border-[#E5E7EB] hover:bg-gray-50 hover:text-[#1F2937] w-full sm:w-auto h-auto transition-all shadow-sm hover:shadow-md"
        >
          {isReadOnly ? "Back" : "Cancel"}
        </Button>
        {!isReadOnly && (
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-[#00A651] hover:bg-[#008F44] text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto h-auto"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Update Case" : "Create Case"}
          </Button>
        )}
      </div>
    </form>
  );
}
