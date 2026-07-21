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
import { Icon } from "@iconify/react";

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
  const caseBasePath = isFinanceStaff ? `/fs-case/${caseId}` : `/em-export-case/${caseId}`;

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
    <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all">
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

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-5">
              <h4 className="text-xl font-extrabold text-[#1F2937] border-b border-[#E8E3D9] pb-3 mb-1">Direct Costs (IDR)</h4>

              <div className="space-y-1.5">
                <Label htmlFor="hpp" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">HPP (Cost of Goods Sold)</Label>
                <Input id="hpp" type="number" step="any" disabled={isReadOnly} {...register("hpp")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.hpp && <p className="text-sm text-red-500 font-bold ml-4">{errors.hpp.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="packaging" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Packaging Cost</Label>
                <Input id="packaging" type="number" step="any" disabled={isReadOnly} {...register("packaging")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.packaging && <p className="text-sm text-red-500 font-bold ml-4">{errors.packaging.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="certification" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Certification Cost</Label>
                <Input id="certification" type="number" step="any" disabled={isReadOnly} {...register("certification")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.certification && <p className="text-sm text-red-500 font-bold ml-4">{errors.certification.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Quantity (Units)</Label>
                <Input id="quantity" type="number" step="1" disabled={isReadOnly} {...register("quantity")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.quantity && <p className="text-sm text-red-500 font-bold ml-4">{errors.quantity.message}</p>}
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-xl font-extrabold text-[#1F2937] border-b border-[#E8E3D9] pb-3 mb-1">Indirect Costs & Margins</h4>

              <div className="space-y-1.5">
                <Label htmlFor="transportation" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Local Transportation (IDR)</Label>
                <Input id="transportation" type="number" step="any" disabled={isReadOnly} {...register("transportation")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.transportation && <p className="text-sm text-red-500 font-bold ml-4">{errors.transportation.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="freight" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Freight (IDR)</Label>
                <Input id="freight" type="number" step="any" disabled={isReadOnly} {...register("freight")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.freight && <p className="text-sm text-red-500 font-bold ml-4">{errors.freight.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="insurance" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Insurance (IDR)</Label>
                <Input id="insurance" type="number" step="any" disabled={isReadOnly} {...register("insurance")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                {errors.insurance && <p className="text-sm text-red-500 font-bold ml-4">{errors.insurance.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exchangeRate" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Exchange Rate</Label>
                  <Input id="exchangeRate" type="number" step="any" disabled={isReadOnly} {...register("exchangeRate")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                  {errors.exchangeRate && <p className="text-sm text-red-500 font-bold ml-4">{errors.exchangeRate.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="targetMargin" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Target Margin (%)</Label>
                  <Input id="targetMargin" type="number" step="any" disabled={isReadOnly} {...register("targetMargin")} className="bg-[#EBF8F2] border-2 border-[#CDEBE0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold" />
                  {errors.targetMargin && <p className="text-sm text-red-500 font-bold ml-4">{errors.targetMargin.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentTerm" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Payment Term</Label>
                <select
                  id="paymentTerm"
                  className="w-full bg-[#EBF8F2] border-2 border-[#CDEBE0] focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all hover:bg-[#E3F4EC] hover:border-[#00A651]/40 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1.5rem_center]"
                  disabled={isReadOnly}
                  {...register("paymentTerm")}
                >
                  <option value="T/T">T/T</option>
                  <option value="L/C">L/C</option>
                  <option value="Doc. Collection">Doc. Collection</option>
                  <option value="Open Account">Open Account</option>
                </select>
                {errors.paymentTerm && <p className="text-sm text-red-500 font-bold ml-4">{errors.paymentTerm.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row justify-between gap-6 border-t border-[#E8E3D9] p-8 bg-gray-50/50">
          <Button type="button" onClick={() => router.push(caseBasePath)} className="bg-[#00A651] hover:bg-[#008F44] text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto h-auto flex items-center justify-center gap-2">
            <Icon icon="solar:arrow-left-bold" className="w-5 h-5" />
            Back to Case
          </Button>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {mutation.isSuccess && (
              <Button type="button" variant="secondary" onClick={() => router.push(
                isFinanceStaff ? `/finance-case/${caseId}/financial` : `/export-case/${caseId}/pricing`
              )}>
                Continue to Pricing
              </Button>
            )}
            {!isReadOnly && (
              <Button type="submit" disabled={mutation.isPending} className="bg-[#00A651] hover:bg-[#008F44] text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto h-auto">
                {mutation.isPending ? "Saving..." : "Save Cost Data"}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
