"use client";

import { CostDataResponse } from "../../lib/types/costing";

interface CostingReadOnlyViewProps {
  cost: CostDataResponse;
}

export function CostingReadOnlyView({ cost }: CostingReadOnlyViewProps) {
  const totalBaseCostIDR =
    (cost.hpp || 0) +
    (cost.packaging || 0) +
    (cost.certification || 0) +
    (cost.transportation || 0) +
    (cost.freight || 0) +
    (cost.insurance || 0);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
        <div>
          <h4 className="text-base font-extrabold text-[#1F2937]">Cost Data Breakdown (Managed by Finance Staff)</h4>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Comprehensive view of production, logistics, and export financial parameters</p>
        </div>
        {cost.updatedAt && (
          <span className="text-[11px] font-bold text-gray-400">
            Last Updated: {new Date(cost.updatedAt).toLocaleString("id-ID")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-bold">
        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Production / HPP</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.hpp || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Packaging & Bundling</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.packaging || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Certification & Compliance</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.certification || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Domestic Transportation</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.transportation || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Freight & Shipping</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.freight || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Export Insurance</p>
          <p className="text-base font-black text-[#1F2937] mt-1">Rp {(cost.insurance || 0).toLocaleString("id-ID")}</p>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold">Exchange Rate</p>
          <p className="text-base font-black text-blue-900 mt-1">Rp {(cost.exchangeRate || 0).toLocaleString("id-ID")} / USD</p>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">Target Margin</p>
          <p className="text-base font-black text-emerald-900 mt-1">{cost.targetMargin || 0}%</p>
        </div>

        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
          <p className="text-[10px] text-purple-600 uppercase tracking-wider font-bold">Shipment Quantity</p>
          <p className="text-base font-black text-purple-900 mt-1">{(cost.quantity || 0).toLocaleString("id-ID")} units</p>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
          <p className="text-[10px] text-amber-600 uppercase tracking-wider font-bold">Payment Term</p>
          <p className="text-base font-black text-amber-900 mt-1">{cost.paymentTerm || "—"}</p>
        </div>

        <div className="p-4 bg-emerald-100/60 rounded-2xl border border-emerald-200 col-span-1 sm:col-span-2 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Total Base Cost (Full CIF Scope)</p>
            <p className="text-lg font-black text-emerald-950 mt-0.5">Rp {totalBaseCostIDR.toLocaleString("id-ID")}</p>
          </div>
          <p className="text-[10px] text-emerald-700 font-medium max-w-xs text-right">
            Includes all parameters. In <strong>Pricing Engine</strong>, costs adapt to selected Incoterm (e.g. <strong>FOB</strong> excludes Freight & Insurance).
          </p>
        </div>
      </div>
    </div>
  );
}
