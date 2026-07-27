"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { Icon } from "@iconify/react";
import { apiScenario, UpdateScenarioRequest } from "../../../../../lib/api/scenario";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../../../../components/ui/alert";
import { CreateScenarioRequest } from "../../../../../lib/types/scenario";
import { toast } from "sonner";
import { ScenarioComparisonMatrix } from "../../../../../components/export-case/ScenarioComparisonMatrix";

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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIncoterm, setEditIncoterm] = useState<"EXW" | "FOB" | "CFR" | "CIF">("EXW");
  const [editMargin, setEditMargin] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Fetch all scenarios
  const { data: scenariosData, isLoading } = useQuery({
    queryKey: ["scenarios", caseId],
    queryFn: () => apiScenario.list(caseId),
  });

  const scenarios = scenariosData?.data?.scenarios || [];

  // Auto-select all scenarios for comparison matrix on initial load
  useEffect(() => {
    if (scenarios.length > 0 && selectedIds.length === 0) {
      setSelectedIds(scenarios.map((s) => s.scenarioId));
    }
  }, [scenarios]);

  // Create scenario mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateScenarioRequest) => apiScenario.create(caseId, data),
    onSuccess: () => {
      setName("");
      setMarginOverride("");
      setNotes("");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["scenarios", caseId] });
      toast.success("Simulation scenario created.");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to create scenario.");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ scenarioId, data }: { scenarioId: string; data: UpdateScenarioRequest }) =>
      apiScenario.update(caseId, scenarioId, data),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["scenarios", caseId] });
      toast.success("Scenario updated and recalculated.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update scenario.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (scenarioId: string) => apiScenario.delete(caseId, scenarioId),
    onSuccess: (_, scenarioId) => {
      setSelectedIds((prev) => prev.filter((id) => id !== scenarioId));
      queryClient.invalidateQueries({ queryKey: ["scenarios", caseId] });
      toast.success("Scenario deleted.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete scenario.");
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

  const startEdit = (sc: any) => {
    setEditingId(sc.scenarioId);
    setEditName(sc.name);
    setEditIncoterm(sc.incoterm);
    setEditMargin(sc.targetMarginOverride ? String(sc.targetMarginOverride) : "");
    setEditNotes(sc.notes || "");
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;
    const data: UpdateScenarioRequest = {
      name: editName,
      incoterm: editIncoterm,
      notes: editNotes || undefined,
    };
    if (editMargin.trim()) data.targetMarginOverride = Number(editMargin);
    updateMutation.mutate({ scenarioId: editingId, data });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter selected scenarios to compare
  const comparisonScenarios = scenarios.filter((s) => selectedIds.includes(s.scenarioId));

  return (
    <div className="space-y-8 pt-2 pb-8">

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Top 2-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Create Simulation Form */}
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

        {/* Right Column: Scenario List */}
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
                    <div key={sc.scenarioId} className="rounded-2xl border border-gray-100 overflow-hidden">
                      {/* Normal view */}
                      {editingId !== sc.scenarioId ? (
                        <div className={`flex items-center justify-between p-4 transition-all ${
                          selectedIds.includes(sc.scenarioId)
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-white hover:bg-gray-50/50"
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(sc.scenarioId)}
                              onChange={() => handleToggleSelect(sc.scenarioId)}
                              className="h-5 w-5 rounded-md border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                            />
                            <div>
                              <p className="font-extrabold text-[#1F2937] text-sm">{sc.name}</p>
                              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-0.5">
                                {new Date(sc.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-700 border-none rounded-full px-3 uppercase font-bold">{sc.incoterm}</Badge>
                            <span className="font-extrabold text-blue-700 text-base min-w-[80px] text-right">
                              ${sc.sellingPriceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={() => startEdit(sc)}
                              className="p-2 rounded-xl text-gray-400 hover:text-[#00A651] hover:bg-emerald-50 transition-all"
                              title="Edit scenario"
                            >
                              <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(sc.scenarioId)}
                              disabled={deleteMutation.isPending}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete scenario"
                            >
                              <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Inline edit form */
                        <form onSubmit={handleUpdate} className="p-4 bg-emerald-50/40 space-y-3">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Editing Scenario</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <input
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Scenario name"
                                className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                              />
                            </div>
                            <div>
                              <select
                                value={editIncoterm}
                                onChange={(e) => setEditIncoterm(e.target.value as any)}
                                className="appearance-none flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                              >
                                <option value="EXW">EXW</option>
                                <option value="FOB">FOB</option>
                                <option value="CFR">CFR</option>
                                <option value="CIF">CIF</option>
                              </select>
                            </div>
                            <div>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Margin override %"
                                value={editMargin}
                                onChange={(e) => setEditMargin(e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button type="submit" disabled={updateMutation.isPending} className="h-9 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white font-bold text-xs px-5">
                              {updateMutation.isPending ? "Saving..." : "Save & Recalculate"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setEditingId(null)} className="h-9 rounded-xl text-xs font-bold">
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Standalone Full-Width Comparison Matrix at the Bottom */}
      <ScenarioComparisonMatrix scenarios={comparisonScenarios} />
    </div>
  );
}
