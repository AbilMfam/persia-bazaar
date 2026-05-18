import { useEffect, useState } from "react";
import { AUTH_CHANGE, auth } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(auth.getCurrentUser());
    const refresh = () => setUser(auth.getCurrentUser());
    window.addEventListener(AUTH_CHANGE, refresh);
    return () => window.removeEventListener(AUTH_CHANGE, refresh);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    logout: () => auth.logout(),
  };
}
