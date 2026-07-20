"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCosting } from "../../lib/api/costing";
import { CostDataResponse, SaveCostDataRequest } from "../../lib/types/costing";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { useUserProfile } from "../../hooks/useUserProfile";

const costingSchema = z.object({
  hpp: z.coerce.number().positive("HPP must be greater than 0"),
  packaging: z.coerce.number().min(0, "Packaging must be at least 0"),
  certification: z.coerce.number().min(0, "Certification must be at least 0"),
  transportation: z.coerce.number().min(0, "Transportation must be at least 0"),
  freight: z.coerce.number().min(0, "Freight must be at least 0"),
  insurance: z.coerce.number().min(0, "Insurance must be at least 0"),
  exchangeRate: z.coerce.number().positive("Exchange Rate must be greater than 0"),
  targetMargin: z.coerce.number().positive("Target Margin must be greater than 0").max(100, "Cannot exceed 100%"),
  quantity: z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be greater than 0"),
  paymentTerm: z.enum(["L/C", "T/T", "Doc. Collection", "Open Account"]),
});

type CostingFormValues = z.infer<typeof costingSchema>;

interface CostingFormProps {
  caseId: string;
  initialData?: CostDataResponse | null;
}

export function CostingForm({ caseId, initialData }: CostingFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>(initialData?.warnings || []);
  const { profile } = useUserProfile();

  const isReadOnly = profile?.role !== "finance_staff" && profile?.role !== "admin";
  const isFinanceStaff = profile?.role === "finance_staff";

  // Role-aware base path: Finance Staff stays within /finance-case, others use /export-case
  const caseBasePath = isFinanceStaff ? `/finance-case/${caseId}` : `/export-case/${caseId}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CostingFormValues>({
    resolver: zodResolver(costingSchema) as any,
    defaultValues: {
      hpp: initialData?.hpp || 0,
      packaging: initialData?.packaging || 0,
      certification: initialData?.certification || 0,
      transportation: initialData?.transportation || 0,
      freight: initialData?.freight || 0,
      insurance: initialData?.insurance || 0,
      exchangeRate: initialData?.exchangeRate || 15000,
      targetMargin: initialData?.targetMargin || 10,
      quantity: initialData?.quantity || 1,
      paymentTerm: (initialData?.paymentTerm as any) || "T/T",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SaveCostDataRequest) => apiCosting.saveCostData(caseId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["cost-data", caseId] });
      setErrorMsg(null);
      if (res.data?.warnings && res.data.warnings.length > 0) {
        setWarnings(res.data.warnings);
      } else {
        setWarnings([]);
      }
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Failed to save cost data.");
      setWarnings([]);
    }
  });

  const onSubmit = (data: CostingFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900">
              <AlertTitle>Review Needed</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 mt-2">
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {mutation.isSuccess && warnings.length === 0 && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Cost data saved successfully. You can now proceed to pricing.</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">Direct Costs (IDR)</h4>
              
              <div className="space-y-2">
                <Label htmlFor="hpp">HPP (Cost of Goods Sold)</Label>
                <Input id="hpp" type="number" step="any" disabled={isReadOnly} {...register("hpp")} />
                {errors.hpp && <p className="text-sm text-red-500">{errors.hpp.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="packaging">Packaging Cost</Label>
                <Input id="packaging" type="number" step="any" disabled={isReadOnly} {...register("packaging")} />
                {errors.packaging && <p className="text-sm text-red-500">{errors.packaging.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification">Certification Cost</Label>
                <Input id="certification" type="number" step="any" disabled={isReadOnly} {...register("certification")} />
                {errors.certification && <p className="text-sm text-red-500">{errors.certification.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Units)</Label>
                <Input id="quantity" type="number" step="1" disabled={isReadOnly} {...register("quantity")} />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium border-b pb-2">Indirect Costs & Margins</h4>
              
              <div className="space-y-2">
                <Label htmlFor="transportation">Local Transportation (IDR)</Label>
                <Input id="transportation" type="number" step="any" disabled={isReadOnly} {...register("transportation")} />
                {errors.transportation && <p className="text-sm text-red-500">{errors.transportation.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="freight">Freight (IDR)</Label>
                <Input id="freight" type="number" step="any" disabled={isReadOnly} {...register("freight")} />
                {errors.freight && <p className="text-sm text-red-500">{errors.freight.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance (IDR)</Label>
                <Input id="insurance" type="number" step="any" disabled={isReadOnly} {...register("insurance")} />
                {errors.insurance && <p className="text-sm text-red-500">{errors.insurance.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exchangeRate">Exchange Rate</Label>
                  <Input id="exchangeRate" type="number" step="any" disabled={isReadOnly} {...register("exchangeRate")} />
                  {errors.exchangeRate && <p className="text-sm text-red-500">{errors.exchangeRate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetMargin">Target Margin (%)</Label>
                  <Input id="targetMargin" type="number" step="any" disabled={isReadOnly} {...register("targetMargin")} />
                  {errors.targetMargin && <p className="text-sm text-red-500">{errors.targetMargin.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerm">Payment Term</Label>
                <select
                  id="paymentTerm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isReadOnly}
                  {...register("paymentTerm")}
                >
                  <option value="T/T">T/T</option>
                  <option value="L/C">L/C</option>
                  <option value="Doc. Collection">Doc. Collection</option>
                  <option value="Open Account">Open Account</option>
                </select>
                {errors.paymentTerm && <p className="text-sm text-red-500">{errors.paymentTerm.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button type="button" variant="outline" onClick={() => router.push(caseBasePath)}>
            Back to Case
          </Button>
          <div className="space-x-4">
            {mutation.isSuccess && (
              <Button type="button" variant="secondary" onClick={() => router.push(
                isFinanceStaff ? `/finance-case/${caseId}/financial` : `/export-case/${caseId}/pricing`
              )}>
                Continue to Pricing
              </Button>
            )}
            {!isReadOnly && (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Cost Data"}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
