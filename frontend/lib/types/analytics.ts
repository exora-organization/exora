export interface RiskSummary {
  low: number;
  medium: number;
  high: number;
}

export interface TeamMember {
  displayName: string;
  email: string;
  role: string;
  status: string;
}

export interface TeamSummary {
  totalMembers: number;
  members: TeamMember[];
  roleCounts: Record<string, number>;
}

export interface DashboardMetrics {
  companyId?: string | null;
  totalExportCases: number;
  activeCases: number;
  averageFeasibilityScore?: number | null;
  casesByStatus: Record<string, number>;
  recentCases: any[];
  riskSummary?: RiskSummary | null;
  teamSummary?: TeamSummary | null;
  totalFreightCost?: number;
  totalInsurance?: number;
  totalExportValue?: number;
  estGrossMargin?: number;
}

