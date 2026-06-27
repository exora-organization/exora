import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../lib/firebase/client";
import { apiUsers } from "../lib/api/users";
import { UserProfile } from "../lib/types/user";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profileResponse = await apiUsers.getCurrentUser();
          setState({
            user,
            profile: profileResponse.data || null,
            loading: false,
          });
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          setState({
            user,
            profile: null,
            loading: false,
          });
        }
      } else {
        setState({
          user: null,
          profile: null,
          loading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return state;
}
