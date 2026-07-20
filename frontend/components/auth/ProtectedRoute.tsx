"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LoadingScreen } from "./LoadingScreen";

// ProtectedRoute is a client-side wrapper that restricts rendering to authenticated users.
// If the user's login profile is still loading or unauthenticated, it presents a loading screen
// and redirects the browser session to the login page while preserving the redirect pathname.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, firebaseUser, profile } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  const isExistingUser = (() => {
    if (!profile?.createdAt) return false;
    const createdTime = new Date(profile.createdAt).getTime();
    // Cutoff time: July 18, 2026 00:00:00 UTC
    const cutoffTime = new Date("2026-07-18T00:00:00Z").getTime();
    return createdTime < cutoffTime;
  })();

  useEffect(() => {
    // Redirect unauthenticated sessions to /login with redirect parameter
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (
        firebaseUser &&
        !firebaseUser.emailVerified &&
        !isExistingUser &&
        !firebaseUser.email?.endsWith("@exora.com")
      ) {
        router.push(`/verify-email?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [loading, isAuthenticated, firebaseUser, isExistingUser, router, pathname]);

  // Keep screen loaded in wait state while fetching auth token or if unverified
  if (
    loading ||
    !isAuthenticated ||
    (firebaseUser &&
      !firebaseUser.emailVerified &&
      !isExistingUser &&
      !firebaseUser.email?.endsWith("@exora.com"))
  ) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
