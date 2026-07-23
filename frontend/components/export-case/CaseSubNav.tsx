"use client";

import { Icon } from "@iconify/react";
import { useUserProfile } from "../../hooks/useUserProfile";

export interface SubNavTab {
  id: string;
  label: string;
  icon: string;
  isReadOnly?: boolean;
}

const ALL_TABS: Record<string, SubNavTab> = {
  overview: { id: "overview", label: "Overview", icon: "solar:widget-bold-duotone" },
  cost: { id: "cost", label: "Cost", icon: "solar:calculator-bold-duotone" },
  pricing: { id: "pricing", label: "Pricing", icon: "solar:tag-price-bold-duotone" },
  scenario: { id: "scenario", label: "Scenario", icon: "solar:map-point-wave-bold-duotone" },
  financial: { id: "financial", label: "Financial Analysis", icon: "solar:chart-square-bold-duotone" },
  risk: { id: "risk", label: "Risk Assessment", icon: "solar:shield-check-bold-duotone" },
  advisor: { id: "advisor", label: "AI Advisor", icon: "solar:lightbulb-bold-duotone" },
  documents: { id: "documents", label: "Documents", icon: "solar:document-text-bold-duotone" },
};

export function getTabsForRole(role?: string): SubNavTab[] {
  if (role === "company_owner") {
    return [
      ALL_TABS.overview,
      { ...ALL_TABS.cost, isReadOnly: true },
      { ...ALL_TABS.pricing, isReadOnly: true },
      { ...ALL_TABS.financial, isReadOnly: true },
      { ...ALL_TABS.risk, isReadOnly: true },
      { ...ALL_TABS.advisor, isReadOnly: true },
      ALL_TABS.documents,
    ];
  }
  if (role === "export_manager") {
    return [
      ALL_TABS.overview,
      { ...ALL_TABS.cost, isReadOnly: true },
      ALL_TABS.pricing,
      ALL_TABS.scenario,
      ALL_TABS.risk,
      ALL_TABS.advisor,
      ALL_TABS.documents,
    ];
  }
  if (role === "finance_staff") {
    return [
      ALL_TABS.overview,
      ALL_TABS.cost,
      ALL_TABS.financial,
      { ...ALL_TABS.advisor, isReadOnly: true },
      ALL_TABS.documents,
    ];
  }
  return [ALL_TABS.overview];
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
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
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
              {tab.isReadOnly && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                  title="View-Only Mode"
                >
                  View Only
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
