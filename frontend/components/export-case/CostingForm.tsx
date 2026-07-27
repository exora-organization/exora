"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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

const formatRupiah = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "" || isNaN(Number(val))) return "";
  const num = Math.floor(Number(val));
  return num.toLocaleString("id-ID");
};

const parseRupiah = (val: string): number => {
  const clean = val.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

const costingSchema = z.object({
  hpp: z.coerce.number().min(100, "HPP must be at least Rp 100"),
  packaging: z.coerce.number().min(500, "Packaging Cost must be at least Rp 500"),
  certification: z.coerce.number().min(1000, "Certification Cost must be at least Rp 1.000"),
  transportation: z.coerce.number().min(1000, "Local Transportation must be at least Rp 1.000"),
  freight: z.coerce.number().min(1000, "Freight must be at least Rp 1.000"),
  insurance: z.coerce.number().min(1000, "Insurance must be at least Rp 1.000"),
  exchangeRate: z.coerce.number().min(1000, "Exchange Rate must be at least Rp 1.000"),
  targetMargin: z.coerce.number().positive("Target Margin must be greater than 0").max(100, "Cannot exceed 100%"),
  quantity: z.coerce.number()
    .positive("Quantity must be greater than 0")
    .refine((val) => Number.isInteger(val), {
      message: "Quantity must be a positive whole number (no decimals allowed)",
    }),
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

  const caseBasePath = isFinanceStaff ? `/fs-export-cases/${caseId}?tab=cost` : `/em-export-case/${caseId}`;

  const {
    register,
    handleSubmit,
    control,
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

  const renderCurrencyInput = (
    name: keyof CostingFormValues,
    id: string,
    label: string,
    placeholder: string,
    helperText?: string
  ) => {
    const hasError = !!errors[name];
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">
          {label}
        </Label>
        <Controller
          name={name}
          control={control}
          render={({ field: { value, onChange, onBlur } }) => {
            const displayVal = value ? formatRupiah(value as number) : "";
            return (
              <div className="relative flex items-center">
                <span className={`absolute left-6 font-bold text-sm pointer-events-none ${hasError ? "text-red-500" : "text-gray-500"}`}>
                  Rp
                </span>
                <Input
                  id={id}
                  type="text"
                  disabled={isReadOnly}
                  value={displayVal}
                  placeholder={placeholder}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = parseRupiah(raw);
                    onChange(parsed);
                  }}
                  onBlur={onBlur}
                  className={`bg-white border-2 transition-all hover:shadow-md rounded-full pl-14 pr-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold ${
                    hasError
                      ? "border-red-400 bg-red-50/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                      : "border-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] hover:bg-gray-50/80 hover:border-gray-300"
                  }`}
                />
              </div>
            );
          }}
        />
        {hasError ? (
          <p className="text-xs text-red-500 font-bold ml-4 flex items-center gap-1.5 mt-1">
            <Icon icon="solar:danger-circle-bold-duotone" className="w-4 h-4 shrink-0" />
            {errors[name]?.message}
          </p>
        ) : (
          helperText && <p className="text-[11px] text-gray-500 font-medium ml-4">{helperText}</p>
        )}
      </div>
    );
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
              <AlertDescription>Export costing data saved successfully. Export Manager has been notified to configure pricing strategy so Financial Viability Analysis can be calculated.</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-5">
              <h4 className="text-xl font-extrabold text-[#1F2937] border-b border-[#E8E3D9] pb-3 mb-1">Direct Costs (IDR)</h4>

              {renderCurrencyInput("hpp", "hpp", "HPP (Cost of Goods Sold per Unit)", "50.000", "Min. Cost: Rp 100 / unit")}
              {renderCurrencyInput("packaging", "packaging", "Packaging Cost", "5.000", "Min. Cost: Rp 500")}
              {renderCurrencyInput("certification", "certification", "Certification Cost", "2.500.000", "Min. Cost: Rp 1.000")}

              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Quantity (Whole Units)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  placeholder="e.g. 1000"
                  disabled={isReadOnly}
                  {...register("quantity", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined) return NaN;
                      const normalized = String(v).trim().replace(",", ".");
                      return Number(normalized);
                    },
                  })}
                  className={`bg-white border-2 transition-all hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold ${
                    errors.quantity
                      ? "border-red-400 bg-red-50/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                      : "border-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] hover:bg-gray-50/80 hover:border-gray-300"
                  }`}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500 font-bold ml-4 flex items-center gap-1.5 mt-1">
                    <Icon icon="solar:danger-circle-bold-duotone" className="w-4 h-4 shrink-0" />
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-xl font-extrabold text-[#1F2937] border-b border-[#E8E3D9] pb-3 mb-1">Indirect Costs & Margins</h4>

              {renderCurrencyInput("transportation", "transportation", "Local Transportation", "3.500.000", "Min. Cost: Rp 1.000")}
              {renderCurrencyInput("freight", "freight", "Freight", "15.000.000", "Min. Cost: Rp 1.000")}
              {renderCurrencyInput("insurance", "insurance", "Insurance", "1.200.000", "Min. Cost: Rp 1.000")}

              <div className="grid grid-cols-2 gap-4">
                {renderCurrencyInput("exchangeRate", "exchangeRate", "Exchange Rate (IDR/USD)", "15.800", "Min. Rate: Rp 1.000")}
                <div className="space-y-1.5">
                  <Label htmlFor="targetMargin" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Target Margin (%)</Label>
                  <Input
                    id="targetMargin"
                    type="number"
                    step="any"
                    placeholder="e.g. 15"
                    disabled={isReadOnly}
                    {...register("targetMargin")}
                    className={`bg-white border-2 transition-all hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold ${
                      errors.targetMargin
                        ? "border-red-400 bg-red-50/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                        : "border-gray-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00A651]/20 focus-visible:border-[#00A651] hover:bg-gray-50/80 hover:border-gray-300"
                    }`}
                  />
                  {errors.targetMargin && (
                    <p className="text-xs text-red-500 font-bold ml-4 flex items-center gap-1.5 mt-1">
                      <Icon icon="solar:danger-circle-bold-duotone" className="w-4 h-4 shrink-0" />
                      {errors.targetMargin.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentTerm" className="font-bold text-[#4B5563] text-xs uppercase tracking-widest ml-4">Payment Term</Label>
                <select
                  id="paymentTerm"
                  className="w-full bg-white border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md rounded-full px-6 py-4 h-auto shadow-sm text-[#1F2937] font-semibold disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1.5rem_center]"
                  disabled={isReadOnly}
                  {...register("paymentTerm")}
                >
                  <option value="T/T">T/T</option>
                  <option value="L/C">L/C</option>
                  <option value="Doc. Collection">Doc. Collection</option>
                  <option value="Open Account">Open Account</option>
                </select>
                {errors.paymentTerm && <p className="text-xs text-red-500 font-bold ml-4 mt-1">{errors.paymentTerm.message}</p>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-6 border-t border-[#E8E3D9] p-8 bg-gray-50/50">
          {!isReadOnly && (
            <Button type="submit" disabled={mutation.isPending} className="bg-[#00A651] hover:bg-[#008F44] text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto h-auto">
              {mutation.isPending ? "Saving..." : "Save Cost Data"}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
