"use client";

import * as React from "react";
// In a real app we might use next-themes, but here is a simple stub
// or we can just render children if next-themes is not installed yet.

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
