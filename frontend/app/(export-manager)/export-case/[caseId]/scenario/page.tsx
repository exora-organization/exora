"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { apiScenario } from "../../../../../lib/api/scenario";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import { CreateScenarioRequest } from "../../../../../lib/types/scenario";

export default function ScenarioAnalysisPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [incoterm, setIncoterm] = useState<"EXW" | "FOB" | "CFR" | "CIF">("EXW");
  const [marginOverride, setMarginOverride] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch all scenarios
  const { data: scenariosData, isLoading, error } = useQuery({
    queryKey: ["scenarios", caseId],
    queryFn: () => apiScenario.list(caseId),
  });

  const scenarios = scenariosData?.data?.scenarios || [];

  // Create scenario mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateScenarioRequest) => apiScenario.create(caseId, data),
    onSuccess: () => {
      setName("");
      setMarginOverride("");
      setNotes("");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["scenarios", caseId] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create scenario.");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: CreateScenarioRequest = {
      name,
      incoterm,
      notes: notes || undefined,
    };

    if (marginOverride.trim()) {
      payload.targetMarginOverride = Number(marginOverride);
    }

    createMutation.mutate(payload);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter selected scenarios to compare
  const comparisonScenarios = scenarios.filter((s) => selectedIds.includes(s.scenarioId));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="mb-5 flex justify-between items-center">
        <Link href={`/export-case/${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A651] hover:bg-[#008F44] text-white text-[13px] font-bold rounded-full shadow-md hover:shadow-lg transition-all">
          <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" /> Back to Case
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#1F2937]">Scenario Analysis</h2>
        <p className="text-[#6B7280] font-medium mt-1">Simulate financial outcomes based on varying market conditions and Incoterms.</p>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Create Form */}
        <div>
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
              <h3 className="text-xl font-extrabold text-[#1F2937]">Create Simulation</h3>
              <p className="text-sm font-medium text-[#6B7280] mt-1">Create a named pricing scenario to compare side-by-side.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">Scenario Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bulk FOB High Margin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-bold text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">Incoterm</label>
                  <div className="relative">
                    <Icon icon="solar:alt-arrow-down-bold-duotone" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={incoterm}
                      onChange={(e) => setIncoterm(e.target.value as any)}
                      className="appearance-none flex h-11 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-bold text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                    >
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CFR">CFR (Cost and Freight)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">Target Margin Override (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Optional: Fallback to case default"
                    value={marginOverride}
                    onChange={(e) => setMarginOverride(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 text-sm font-bold text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest block mb-1.5">Notes</label>
                  <textarea
                    placeholder="Provide additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#1F2937] transition-all focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full h-12 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-[13px] shadow-md hover:shadow-lg transition-all" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating simulation..." : "Run Simulation"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Scenario List and Comparison Matrix */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
            <div className="bg-white/50 backdrop-blur-sm border-b border-white/60 px-6 py-5">
              <h3 className="text-xl font-extrabold text-[#1F2937]">Scenarios List</h3>
              <p className="text-sm font-medium text-[#6B7280] mt-1">Select scenarios below to perform side-by-side comparison matrix analyses.</p>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="p-8 text-center text-[#9CA3AF] font-bold">Loading simulations...</div>
              ) : scenarios.length === 0 ? (
                <div className="p-8 text-center text-[#9CA3AF] border-2 border-dashed border-gray-200 rounded-2xl font-bold">
                  No simulation scenarios created yet. Run a simulation using the form.
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((sc) => (
                    <div
                      key={sc.scenarioId}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedIds.includes(sc.scenarioId)
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sc.scenarioId)}
                          onChange={() => handleToggleSelect(sc.scenarioId)}
                          className="h-5 w-5 rounded-md border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                        />
                        <div>
                          <p className="font-extrabold text-[#1F2937] text-sm">{sc.name}</p>
                          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">Created: {new Date(sc.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-full px-3 uppercase font-bold">{sc.incoterm}</Badge>
                        <span className="font-extrabold text-blue-700 text-lg">
                          ${sc.sellingPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comparison Matrix Table */}
          {comparisonScenarios.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform">
              <div className="bg-amber-50/50 backdrop-blur-sm border-b border-amber-100 px-6 py-5">
                <h3 className="text-xl font-extrabold text-amber-900">Comparison Matrix</h3>
                <p className="text-sm font-medium text-amber-700/80 mt-1">Side-by-side comparison of selected scenarios.</p>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                      <th className="px-6 py-4">Metric</th>
                      {comparisonScenarios.map((sc) => (
                        <th key={sc.scenarioId} className="px-6 py-4 min-w-[150px] font-extrabold text-[#1F2937] text-sm">
                          {sc.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#4B5563]">Incoterm</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-full px-3 uppercase font-bold">{sc.incoterm}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#4B5563]">Total Cost (IDR)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-[#1F2937]">
                          {sc.totalCostIDR.toLocaleString()} IDR
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#4B5563]">Selling Price (IDR)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-blue-700">
                          {sc.sellingPriceIDR.toLocaleString()} IDR
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-emerald-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#4B5563]">Selling Price (USD)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap text-emerald-700 font-black text-lg">
                          ${sc.sellingPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#4B5563]">Margin (%)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-4 whitespace-nowrap font-black text-[#1F2937]">
                          {sc.actualMarginPct}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
