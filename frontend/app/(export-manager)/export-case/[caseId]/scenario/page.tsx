"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { apiScenario } from "../../../../../lib/api/scenario";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../../../components/ui/card";
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
      <div>
        <Link href={`/export-case/${caseId}`} className="text-sm text-blue-500 hover:underline mb-2 block">
          &larr; Back to Case Details
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Scenario Analysis</h2>
        <p className="text-gray-500 mt-1">Simulate financial outcomes based on varying market conditions and Incoterms.</p>
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
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Create Simulation</CardTitle>
              <CardDescription>Create a named pricing scenario to compare side-by-side.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Scenario Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bulk FOB High Margin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Incoterm</label>
                  <select
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value as any)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EXW">EXW (Ex Works)</option>
                    <option value="FOB">FOB (Free On Board)</option>
                    <option value="CFR">CFR (Cost and Freight)</option>
                    <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Target Margin Override (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Optional: Fallback to case default"
                    value={marginOverride}
                    onChange={(e) => setMarginOverride(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Notes</label>
                  <textarea
                    placeholder="Provide additional details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating simulation..." : "Run Simulation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scenario List and Comparison Matrix */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scenarios List</CardTitle>
              <CardDescription>Select scenarios below to perform side-by-side comparison matrix analyses.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Loading simulations...</div>
              ) : scenarios.length === 0 ? (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-md">
                  No simulation scenarios created yet. Run a simulation using the form.
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((sc) => (
                    <div
                      key={sc.scenarioId}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        selectedIds.includes(sc.scenarioId)
                          ? "bg-indigo-50/40 border-indigo-200"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sc.scenarioId)}
                          onChange={() => handleToggleSelect(sc.scenarioId)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{sc.name}</p>
                          <p className="text-xs text-slate-400">Created: {new Date(sc.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-600 uppercase">{sc.incoterm}</Badge>
                        <span className="font-bold text-slate-800 text-sm">
                          ${sc.sellingPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison Matrix Table */}
          {comparisonScenarios.length > 0 && (
            <Card className="border-slate-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
                <CardTitle className="text-lg">Comparison Matrix</CardTitle>
                <CardDescription>Side-by-side comparison of selected scenarios.</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-xs font-semibold uppercase text-slate-500">
                      <th className="px-6 py-3">Metric</th>
                      {comparisonScenarios.map((sc) => (
                        <th key={sc.scenarioId} className="px-6 py-3 min-w-[150px] font-bold text-slate-800">
                          {sc.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-500">Incoterm</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-3.5 whitespace-nowrap">
                          <Badge className="bg-slate-600 uppercase">{sc.incoterm}</Badge>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-500">Total Cost (IDR)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-3.5 whitespace-nowrap text-slate-800">
                          {sc.totalCostIDR.toLocaleString()} IDR
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-500">Selling Price (IDR)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-3.5 whitespace-nowrap text-slate-800 font-semibold">
                          {sc.sellingPriceIDR.toLocaleString()} IDR
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-500">Selling Price (USD)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-3.5 whitespace-nowrap text-indigo-600 font-bold">
                          ${sc.sellingPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 font-medium text-slate-500">Margin (%)</td>
                      {comparisonScenarios.map((sc) => (
                        <td key={sc.scenarioId} className="px-6 py-3.5 whitespace-nowrap text-emerald-600 font-semibold">
                          {sc.actualMarginPct}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
