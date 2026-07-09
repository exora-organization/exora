"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../lib/firebase/client";
import { apiUsers } from "../lib/api/users";
import { UserProfile, UserRole } from "../lib/types/user";

export function useUserProfile() {
  const queryClient = useQueryClient();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setFirebaseLoading(false);
      if (user) {
        // Set the token cookie for middleware.ts
        user.getIdToken().then((token) => {
          document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;
        });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      } else {
        document.cookie = "firebaseToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        queryClient.removeQueries({ queryKey: ["user-profile"] });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data, isLoading: queryLoading, error, isError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => apiUsers.getCurrentUser(),
    enabled: !!firebaseUser,
    retry: false,
  });

  const profile = data?.data || null;
  const loading = firebaseLoading || (!!firebaseUser && queryLoading);
  const isAuthenticated = !!firebaseUser && !!profile;

  // Handle Session Expiration (401, 403, 404 -> sign out)
  useEffect(() => {
    if (isError) {
      const status = (error as any)?.status;
      if (status === 401 || status === 403 || status === 404) {
        import("../lib/firebase/auth").then(({ signOut }) => {
          signOut();
        });
      }
    }
  }, [isError, error]);

  return {
    profile,
    role: (profile?.role as UserRole) || null,
    companyId: profile?.companyId || null,
    loading,
    isAuthenticated,
    firebaseUser,
  };
}
