"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard, Users, Package, Calendar, ShoppingCart, FileText, MapPin,
  TrendingUp, Menu, Home, LogOut, Mail, Tag, Plane, PenSquare, ChevronLeft,
  X, Palette, Receipt,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "POS / Receipts", href: "/admin/pos", icon: Receipt },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Inbox", href: "/admin/inbox", icon: Mail },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Destinations", href: "/admin/destinations", icon: MapPin },
  { label: "Trips", href: "/admin/trips", icon: Plane },
  { label: "Deals", href: "/admin/deals", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Services", href: "/admin/services", icon: FileText },
  { label: "Content", href: "/admin/content", icon: PenSquare },
  { label: "Branding", href: "/admin/branding", icon: Palette },
  { label: "Reports", href: "/admin/reports", icon: TrendingUp },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/admin");
  }, [logout, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
          F
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-base leading-none truncate">Founders</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">
              Control Room
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition relative ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
              )}
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium flex-1">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="p-3 border-t border-slate-100 space-y-1 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
          title={collapsed ? "Public site" : undefined}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Public site</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button - fixed */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[70] bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-[80] w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar - fixed, never scrolls with page */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 ${
          collapsed ? "w-20" : "w-64"
        } transition-all duration-300 bg-white border-r border-slate-200 flex-col`}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-sm"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft
            className={`w-3.5 h-3.5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </aside>

      {/* Spacer div to push content to the right */}
      <div
        className={`hidden lg:block flex-shrink-0 ${
          collapsed ? "w-20" : "w-64"
        } transition-all duration-300`}
      />
    </>
  );
}
