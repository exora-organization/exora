"use client";

import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-2xl bg-white dark:bg-gray-800 border border-[#E8E3D9] dark:border-gray-700 hover:border-[#00A651] dark:hover:border-[#00A651] text-gray-700 dark:text-gray-200 hover:text-[#00A651] dark:hover:text-[#00A651] shadow-sm transition-all cursor-pointer flex items-center justify-center"
      title={isDark ? "Switch to Light Mode / Mode Terang" : "Switch to Dark Mode / Mode Gelap"}
    >
      <Icon
        icon={isDark ? "solar:sun-bold-duotone" : "solar:moon-bold-duotone"}
        className={`w-5 h-5 transition-transform duration-300 ${isDark ? "text-amber-400 rotate-90" : "text-indigo-500"}`}
      />
    </button>
  );
}
