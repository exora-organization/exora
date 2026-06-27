"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import { User } from "firebase/auth";
import { UserProfile } from "../../lib/types/user";
import { useAuth as useFirebaseAuth } from "../../hooks/useAuth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useFirebaseAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
