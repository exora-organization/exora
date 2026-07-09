export interface Scenario {
  scenarioId: string;
  caseId: string;
  name: string;
  incoterm: "EXW" | "FOB" | "CFR" | "CIF";
  targetMarginOverride?: number;
  totalCostIDR: number;
  sellingPriceIDR: number;
  sellingPriceUSD: number;
  profitIDR?: number;
  actualMarginPct: number;
  createdAt: string;
}

export interface CreateScenarioRequest {
  name: string;
  incoterm: "EXW" | "FOB" | "CFR" | "CIF";
  targetMarginOverride?: number;
  notes?: string;
}

export interface CreateScenarioResponse {
  caseId: string;
  scenario: Scenario;
}

export interface ListScenariosResponse {
  caseId: string;
  scenarios: Scenario[];
}

export interface ComparisonResponse {
  caseId: string;
  comparison: Scenario[];
}
