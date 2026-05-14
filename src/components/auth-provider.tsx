"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

/**
 * Provides reactive auth state to client components. Hydrates from
 * `supabase.auth.getUser()` once, then stays in sync via
 * `onAuthStateChange` (sign-in, sign-out, token refresh).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    try {
      const supabase = createClient();

      supabase.auth
        .getUser()
        .then(({ data }) => {
          if (mounted) {
            setUser(data.user ?? null);
            setLoading(false);
          }
        })
        .catch(() => {
          if (mounted) setLoading(false);
        });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch {
      // Env not configured yet — leave defaults so the storefront still renders.
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
