"use client";

import { Badge } from "../ui/badge";
import { Scenario } from "../../lib/types/scenario";

interface ScenarioComparisonMatrixProps {
  scenarios: Scenario[];
  title?: string;
  subtitle?: string;
}

export function ScenarioComparisonMatrix({
  scenarios,
  title = "Comparison Matrix",
  subtitle = "Side-by-side comparison of selected scenarios.",
}: ScenarioComparisonMatrixProps) {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform w-full">
      <div className="bg-amber-50/50 backdrop-blur-sm border-b border-amber-100 px-6 py-5">
        <h3 className="text-xl font-extrabold text-amber-900">{title}</h3>
        <p className="text-sm font-medium text-amber-700/80 mt-1">{subtitle}</p>
      </div>
      <div className="overflow-x-auto p-2">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-100 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              <th className="px-6 py-4">Metric</th>
              {scenarios.map((sc) => (
                <th key={sc.scenarioId} className="px-6 py-4 min-w-[160px] font-extrabold text-[#1F2937] text-sm">
                  {sc.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-[#F9FAFB] transition-colors">
              <td className="px-6 py-4 font-bold text-[#4B5563]">Incoterm</td>
              {scenarios.map((sc) => (
                <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap">
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-full px-3 uppercase font-bold">{sc.incoterm}</Badge>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[#F9FAFB] transition-colors">
              <td className="px-6 py-4 font-bold text-[#4B5563]">Total Cost (IDR)</td>
              {scenarios.map((sc) => (
                <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-[#1F2937]">
                  {(sc.totalCostIDR || 0).toLocaleString()} IDR
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[#F9FAFB] transition-colors">
              <td className="px-6 py-4 font-bold text-[#4B5563]">Selling Price (IDR)</td>
              {scenarios.map((sc) => (
                <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-blue-700">
                  {(sc.sellingPriceIDR || 0).toLocaleString()} IDR
                </td>
              ))}
            </tr>
            <tr className="hover:bg-emerald-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-[#4B5563]">Selling Price (USD)</td>
              {scenarios.map((sc) => (
                <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap text-emerald-700 font-black text-lg">
                  ${(sc.sellingPriceUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[#F9FAFB] transition-colors">
              <td className="px-6 py-4 font-bold text-[#4B5563]">Margin (%)</td>
              {scenarios.map((sc) => (
                <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-[#1F2937]">
                  {sc.actualMarginPct}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
