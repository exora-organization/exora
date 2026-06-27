export interface DashboardMetrics {
  companyId?: string | null;
  totalExportCases: number;
  activeCases: number;
  averageFeasibilityScore?: number | null;
  casesByStatus: Record<string, number>;
  recentCases: any[];
}
