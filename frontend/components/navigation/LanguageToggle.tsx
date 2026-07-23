"use client";

import { useLanguage } from "../providers/LanguageProvider";
import { Icon } from "@iconify/react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-[#E8E3D9] dark:border-slate-700 hover:border-[#00A651] dark:hover:border-[#00A651] text-gray-700 dark:text-gray-200 hover:text-[#00A651] dark:hover:text-[#00A651] shadow-sm transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black tracking-wider uppercase"
      title={language === "en" ? "Switch to Bahasa Indonesia" : "Switch to English"}
    >
      <Icon icon="solar:global-bold-duotone" className="w-4 h-4 text-[#00A651]" />
      <span>{language === "en" ? "EN" : "ID"}</span>
    </button>
  );
}
