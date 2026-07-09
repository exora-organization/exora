"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LoadingScreen } from "./LoadingScreen";

// ProtectedRoute is a client-side wrapper that restricts rendering to authenticated users.
// If the user's login profile is still loading or unauthenticated, it presents a loading screen
// and redirects the browser session to the login page while preserving the redirect pathname.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect unauthenticated sessions to /login with redirect parameter
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  // Keep screen loaded in wait state while fetching auth token
  if (loading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
