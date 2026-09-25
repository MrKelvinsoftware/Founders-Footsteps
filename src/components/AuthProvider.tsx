"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: "customer" | "admin" | "staff";
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "ff_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Validate the stored session against the server ───────────────────────
  const validateSession = useCallback(async (stored: User): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the stored data as a fallback; the server prefers the httpOnly cookie
        body: JSON.stringify({ userId: stored.id, email: stored.email }),
      });
      const data = await res.json();
      if (data.valid && data.user) return data.user as User;
      return null;
    } catch {
      // Network error — keep user logged in with stale data rather than force-logout
      return stored;
    }
  }, []);

  // ── Bootstrap auth state on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // First try a cookie-only validation (no body required after first login)
        const res = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();

        if (data.valid && data.user) {
          setUser(data.user as User);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
          return;
        }

        // Cookie miss — try the localStorage fallback
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const stored = JSON.parse(raw) as User;
          const validated = await validateSession(stored);
          if (validated) {
            setUser(validated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        // Ignore — isLoading will be set to false below
      } finally {
        setIsLoading(false);
      }
    })();
  }, [validateSession]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error ?? "Invalid email or password");

    const loggedIn = json.data as User;
    setUser(loggedIn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    return loggedIn;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Clear the httpOnly session cookie on the server
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Refresh ───────────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!user) return;
    const validated = await validateSession(user);
    if (validated) {
      setUser(validated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } else {
      await logout();
    }
  }, [user, validateSession, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === "admin",
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
