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

  useEffect(() => {
    // Once auth state is resolved, redirect non-admins away from sub-pages
    if (isLoading) return;
    if (!isLoginPage && (!user || !isAdmin)) {
      router.replace(`/admin?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, isAdmin, isLoginPage, pathname, router]);

  // ── Loading spinner ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold text-xl animate-pulse">
            F
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Authenticating session
          </p>
        </div>
      </div>
    );
  }

  // ── Login portal (the /admin page itself) ────────────────────────────────
  // Always render children on the login page — admin/page.tsx owns the UI.
  if (isLoginPage) {
    // If already authenticated as admin, push them into the dashboard shell
    if (user && isAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 flex">
          <AdminSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      );
    }
    // Not yet authenticated — show the login portal
    return <>{children}</>;
  }

  // ── Admin sub-pages ──────────────────────────────────────────────────────
  // The useEffect above will redirect if the user isn't an admin.
  // Render a blank screen while the redirect is in flight to avoid a flash.
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
      </div>
    );
  }

  // ── Authenticated admin layout ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
