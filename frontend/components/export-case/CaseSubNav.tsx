"use client";

import { Icon } from "@iconify/react";
import { useUserProfile } from "../../hooks/useUserProfile";

export interface SubNavTab {
  id: string;
  label: string;
  icon: string;
  isReadOnly?: boolean;
  ownerRoleBadge?: string;
}

const ALL_TABS: Record<string, SubNavTab> = {
  overview: { id: "overview", label: "Overview", icon: "solar:widget-bold-duotone" },
  cost: { id: "cost", label: "Cost", icon: "solar:calculator-bold-duotone", ownerRoleBadge: "Finance" },
  pricing: { id: "pricing", label: "Pricing", icon: "solar:tag-price-bold-duotone", ownerRoleBadge: "Export Mgr" },
  scenario: { id: "scenario", label: "Scenario", icon: "solar:map-point-wave-bold-duotone", ownerRoleBadge: "Export Mgr" },
  financial: { id: "financial", label: "Financial Analysis", icon: "solar:chart-square-bold-duotone", ownerRoleBadge: "Finance" },
  risk: { id: "risk", label: "Risk Assessment", icon: "solar:shield-check-bold-duotone", ownerRoleBadge: "Export Mgr" },
  advisor: { id: "advisor", label: "AI Advisor", icon: "solar:lightbulb-bold-duotone" },
  documents: { id: "documents", label: "Documents", icon: "solar:document-text-bold-duotone" },
};

export function getTabsForRole(role?: string): SubNavTab[] {
  if (role === "company_owner") {
    return [
      ALL_TABS.overview,
      { ...ALL_TABS.cost, isReadOnly: true },
      { ...ALL_TABS.pricing, isReadOnly: true },
      { ...ALL_TABS.scenario, isReadOnly: true },
      { ...ALL_TABS.financial, isReadOnly: true },
      { ...ALL_TABS.risk, isReadOnly: true },
      ALL_TABS.advisor,
      ALL_TABS.documents,
    ];
  }
  if (role === "export_manager") {
    return [
      ALL_TABS.overview,
      { ...ALL_TABS.cost, isReadOnly: true },
      ALL_TABS.pricing,
      ALL_TABS.scenario,
      { ...ALL_TABS.financial, isReadOnly: true },
      ALL_TABS.risk,
      ALL_TABS.advisor,
      ALL_TABS.documents,
    ];
  }
  if (role === "finance_staff") {
    return [
      ALL_TABS.overview,
      ALL_TABS.cost,
      { ...ALL_TABS.pricing, isReadOnly: true },
      { ...ALL_TABS.scenario, isReadOnly: true },
      ALL_TABS.financial,
      { ...ALL_TABS.risk, isReadOnly: true },
      ALL_TABS.advisor,
      ALL_TABS.documents,
    ];
  }

  // Admin / Default
  return [
    ALL_TABS.overview,
    ALL_TABS.cost,
    ALL_TABS.pricing,
    ALL_TABS.scenario,
    ALL_TABS.financial,
    ALL_TABS.risk,
    ALL_TABS.advisor,
    ALL_TABS.documents,
  ];
}

interface CaseSubNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CaseSubNav({ activeTab, onTabChange }: CaseSubNavProps) {
  const { role } = useUserProfile();
  const tabs = getTabsForRole(role || undefined);

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-2.5 my-4 transition-all">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-[#00A651] text-white shadow-md shadow-[#00A651]/20"
                  : "text-[#4B5563] hover:bg-[#EBF8F2] hover:text-[#00A651]"
              }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.isReadOnly && tab.ownerRoleBadge && (
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-lg uppercase font-black tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700 border border-blue-200/60"
                  }`}
                  title={`Managed by ${tab.ownerRoleBadge}`}
                >
                  {tab.ownerRoleBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

