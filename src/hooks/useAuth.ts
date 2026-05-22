import { useEffect, useState } from "react";
import { AUTH_CHANGE, auth } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    typeof window !== "undefined" ? auth.getCurrentUser() : null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void auth.bootstrap().finally(() => {
      if (!cancelled) {
        setUser(auth.getCurrentUser());
        setReady(true);
      }
    });
    const refresh = () => setUser(auth.getCurrentUser());
    window.addEventListener(AUTH_CHANGE, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGE, refresh);
    };
  }, []);

  return {
    user,
    ready,
    isLoggedIn: !!user,
    logout: () => auth.logout(),
  };
}
