"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import AdminSidebar from "@/components/AdminSidebar";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin";

  // Redirect unauthenticated users away from sub-pages
  useEffect(() => {
    if (isLoading) return; // Wait until auth resolves
    if (!isLoginPage && (!user || !isAdmin)) {
      const next = encodeURIComponent(pathname);
      router.replace(`/admin?next=${next}`);
    }
  }, [isLoading, user, isAdmin, isLoginPage, pathname, router]);

  // ── Loading screen ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-xl animate-pulse">
            F
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  // ── Login portal (/admin) ──────────────────────────────────────
  if (isLoginPage) {
    // Authenticated admin on the login page → show full dashboard layout
    if (user && isAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 flex">
          <AdminSidebar />
          <div className="flex-1 min-w-0 lg:ml-64">{children}</div>
        </div>
      );
    }
    // Not authenticated → show the login portal (admin/page.tsx handles the UI)
    return <>{children}</>;
  }

  // ── Admin sub-pages ────────────────────────────────────────────
  // Show placeholder while redirect is in-flight (useEffect above handles it)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Authenticated admin sub-page ───────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 lg:ml-64">{children}</div>
    </div>
  );
}
