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

  // ── Validate session against server ─────────────────────────────
  // Always prefers the httpOnly cookie (checked server-side).
  // Falls back to the localStorage userId/email if the cookie is missing
  // (e.g. user logged in before the cookie-based auth was added).
  const validateSession = useCallback(async (stored?: User): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          stored ? { userId: stored.id, email: stored.email } : {}
        ),
        // Always send cookies
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.valid && data.user) return data.user as User;
      return null;
    } catch {
      // Network error — preserve stored user so we don't log out on flaky connection
      return stored ?? null;
    }
  }, []);

  // ── Bootstrap auth on mount ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        // Step 1 — try validating via cookie alone (no body needed)
        const cookieUser = await validateSession();
        if (cookieUser) {
          setUser(cookieUser);
          // Sync to localStorage so subsequent refreshes are instant
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cookieUser));
          return;
        }

        // Step 2 — cookie miss, try localStorage fallback
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const stored = JSON.parse(raw) as User;
        const validated = await validateSession(stored);
        if (validated) {
          setUser(validated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [validateSession]);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error ?? "Invalid email or password");
    const loggedIn = json.data as User;
    setUser(loggedIn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    return loggedIn;
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // best-effort
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Refresh ──────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!user) return;
    const updated = await validateSession(user);
    if (updated) {
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
