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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { ExportCaseResponse } from "../../lib/types/export-case";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  product: z.string().min(2, "Product must be at least 2 characters").max(200),
  destinationCountry: z.string().min(2, "Destination country must be at least 2 characters").max(100),
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Export Case" : "Create New Export Case"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Case Name</Label>
            <Input
              id="name"
              placeholder="e.g. Coffee Beans to Japan 2026"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              placeholder="e.g. Arabica Coffee Beans"
              {...register("product")}
            />
            {errors.product && <p className="text-sm text-red-500">{errors.product.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationCountry">Destination Country</Label>
            <Input
              id="destinationCountry"
              placeholder="e.g. Japan"
              {...register("destinationCountry")}
            />
            {errors.destinationCountry && <p className="text-sm text-red-500">{errors.destinationCountry.message}</p>}
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...register("status")}
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="finalized">Finalized</option>
              </select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {errorMsg}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update Case" : "Create Case"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
