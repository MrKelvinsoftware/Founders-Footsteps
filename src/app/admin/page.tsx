"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Package, Calendar, ShoppingCart, FileText, MapPin,
  TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
  Bell, Search, Menu, X, Home, Car, Utensils, Plane, Scissors, Truck, Wrench,
  LogOut, Activity, Mail, ArrowRight, CircleDot,
  ChevronRight, Eye, EyeOff, Tag, Sparkles, Building2, RefreshCw, PenSquare,
} from "lucide-react";
import { getSubmissions, type Submission } from "@/lib/submissions";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
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
  { label: "Reports", href: "/admin/reports", icon: TrendingUp },
];

const SERVICE_META: Record<string, { name: string; icon: typeof Home; color: string }> = {
  construction: { name: "Construction", icon: Home, color: "#64748b" },
  "car-rental": { name: "Car Services", icon: Car, color: "#2563eb" },
  event: { name: "Catering & Events", icon: Utensils, color: "#d97706" },
  travel: { name: "Travel & Trips", icon: Plane, color: "#0891b2" },
  salon: { name: "Salon & Beauty", icon: Scissors, color: "#c026d3" },
  logistics: { name: "Logistics", icon: Truck, color: "#059669" },
  "tech-repair": { name: "Tech Repairs", icon: Wrench, color: "#7c3aed" },
  marketplace: { name: "Marketplace", icon: ShoppingCart, color: "#ef4444" },
};

const ticker = [
  "Founders & Footsteps Control Room",
  "Construction · Car Rental · Catering & Events",
  "Travel & Trips · Salon & Beauty · Logistics",
  "Tech Repairs · Marketplace",
  "One dashboard. Every service line.",
];

function useCountUp(target: number, duration = 1200, start = true) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      ref.current = Math.round(target * eased);
      setValue(ref.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function useDashboardData() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    const all = await getSubmissions();
    setSubmissions(all);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => {
    const orders = submissions.filter((s) => s.type === "marketplace");
    const bookings = submissions.filter((s) => s.type !== "marketplace");
    const totalRevenue = submissions.reduce((sum, s) => sum + (s.total || 0), 0);
    const avgOrderValue = orders.length ? Math.round(orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length) : 0;
    const uniqueCustomers = new Set(submissions.map((s) => s.customer?.email?.toLowerCase()).filter(Boolean)).size;

    const byService = new Map<string, { count: number; revenue: number }>();
    for (const s of submissions) {
      const cur = byService.get(s.type) || { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += (s.total || 0);
      byService.set(s.type, cur);
    }
    
    const allTypes = ["construction", "car-rental", "event", "travel", "salon", "logistics", "tech-repair"];
    const serviceLines = allTypes.map(type => {
      const v = byService.get(type) || { count: 0, revenue: 0 };
      return { type, ...v, meta: SERVICE_META[type] || { name: type, icon: Activity, color: "#475569" } };
    }).sort((a, b) => b.revenue - a.revenue);
    
    const maxServiceRevenue = Math.max(1, ...serviceLines.map((s) => s.revenue));

    const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const recentBookings = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const recentActivity = [...submissions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

    const pendingCount = submissions.filter((s) => s.status === "pending").length;

    return {
      totalRevenue, ordersCount: orders.length, bookingsCount: bookings.length,
      uniqueCustomers, avgOrderValue, serviceLines, maxServiceRevenue,
      recentOrders, recentBookings, recentActivity, pendingCount,
    };
  }, [submissions]);

  return { ...data, loading, lastUpdated, refresh: load, isEmpty: submissions.length === 0 };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function LoginPortal() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== "admin") {
        logout();
        throw new Error("This account does not have admin access.");
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 grid lg:grid-cols-[1.15fr_1fr]">
      <div className="relative overflow-hidden hidden lg:flex flex-col justify-between p-14 admin-grid">
        <div className="absolute inset-0 admin-radial pointer-events-none" />
        <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-blue-400/10 to-transparent animate-scan pointer-events-none" />

        <header className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-display font-black text-lg">F</div>
            <div>
              <p className="font-display text-xl leading-none">Founders &amp; Footsteps</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400 mt-1">Control Room</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </header>

        <div className="relative z-10 max-w-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-blue-300/80 mb-6">Admin Portal</p>
          <h1 className="font-display text-[64px] leading-[0.95] tracking-tight">
            Every service.<br/>
            <em className="text-blue-300">One desk.</em><br/>
            Zero guesswork.
          </h1>
          <p className="mt-6 text-slate-300/90 text-lg max-w-md leading-relaxed">
            Construction, travel, events, marketplace, logistics, salon — running through a single pane of glass. This is where it all moves.
          </p>
        </div>

        <div className="relative z-10 -mx-14 border-t border-white/5 bg-black/30 backdrop-blur-sm py-3 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-marquee text-sm text-slate-400">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                <CircleDot className="w-3 h-3 text-blue-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-8 lg:p-14 bg-[#0b0f17]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-display font-black">F</div>
            <p className="font-display text-xl">Founders &amp; Footsteps</p>
          </div>

          <p className="text-xs uppercase tracking-[0.32em] text-slate-400 mb-3">Secure access</p>
          <h2 className="font-display text-5xl leading-[1.02] mb-3">
            Sign in to<br/><em className="text-blue-300">operate.</em>
          </h2>
          <p className="text-slate-400 mb-10">Restricted to authorised personnel only.</p>

          {err && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Work email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@foundersfootsteps.com" className="w-full pl-11 pr-4 py-3.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.05] transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-4 pr-12 py-3.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:bg-white/[0.05] transition" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="group w-full py-3.5 rounded-lg bg-white text-slate-900 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition disabled:opacity-60">
              {loading ? "Authenticating…" : "Enter control room"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            ← Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, prefix = "", icon: Icon, accent, big = false, series }: { label: string; value: number; prefix?: string; trend?: number; icon: typeof DollarSign; accent: string; big?: boolean; series?: number[] }) {
  const n = useCountUp(value);
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/70 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all group ${big ? "md:col-span-2 md:row-span-2" : ""}`}>
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-[0.06] group-hover:opacity-[0.10] transition-opacity" style={{ background: accent }} />
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, color: accent }}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-5 text-[11px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`font-display mt-1 ${big ? "text-5xl" : "text-3xl"} leading-none text-slate-900`}>
        {prefix}{n.toLocaleString()}
      </p>
      {big && series && series.length > 0 && (
        <div className="mt-5 h-16 flex items-end gap-1.5">
          {series.map((v: number, i: number) => (
            <div key={i} className="flex-1 rounded-sm origin-bottom animate-grow-x" style={{ height: `${Math.max(4, (v / Math.max(...series)) * 100)}%`, background: i === series.length - 1 ? accent : `${accent}40`, animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ user, onLogout }: { user: { firstName: string; lastName: string; email: string }; onLogout: () => void }) {
  const [open, setOpen] = useState(true);
  const d = useDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${open ? "w-64" : "w-20"} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen`}>
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display font-black text-lg flex-shrink-0">F</div>
          {open && (
            <div className="min-w-0">
              <p className="font-display text-base leading-none truncate">Founders</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">Control Room</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/admin";
            return (
              <Link key={item.label} href={item.href} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition relative ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {open && <span className="text-sm font-medium flex-1">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100">
            <Home className="w-4 h-4" />
            {open && <span className="text-sm">Public site</span>}
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" />
            {open && <span className="text-sm">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            {open ? <Menu className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input placeholder="Search orders, customers, bookings…" className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 focus:outline-none text-sm" />
          </div>
          <div className="flex-1 md:hidden" />
          <div className="flex items-center gap-2">
            <button onClick={d.refresh} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${d.loading ? "animate-spin" : ""}`} />
            </button>
            <span className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" /><span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
              Live
            </span>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
              {d.pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm ring-2 ring-white flex-shrink-0">
                {user?.firstName?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 lg:p-8 space-y-8">
          <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-rise">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-blue-600 font-semibold">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-slate-900 mt-2 leading-[1.02]">
                Good day, <em>{user.firstName}.</em>
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl">
                {d.serviceLines.length} service line{d.serviceLines.length === 1 ? "" : "s"} active, <span className="text-slate-900 font-semibold">{d.pendingCount} pending</span> request{d.pendingCount === 1 ? "" : "s"} awaiting review.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/products" className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 flex items-center gap-2"><Package className="w-4 h-4" /> New product</Link>
              <Link href="/admin/deals" className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 flex items-center gap-2"><Tag className="w-4 h-4" /> Create deal</Link>
            </div>
          </section>

          {d.isEmpty && !d.loading && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">No activity yet</p>
                <p className="text-sm text-amber-700 mt-0.5">Once customers place orders or make bookings on the public site, everything below fills in automatically.</p>
              </div>
            </div>
          )}

          {/* Stat grid */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard big label="Total revenue" value={d.totalRevenue} prefix="GH₵" icon={DollarSign} accent="#2563eb" series={d.serviceLines.map((s) => s.revenue)} />
            <StatCard label="Orders" value={d.ordersCount} icon={ShoppingCart} accent="#059669" />
            <StatCard label="Bookings" value={d.bookingsCount} icon={Calendar} accent="#7c3aed" />
            <StatCard label="Customers" value={d.uniqueCustomers} icon={Users} accent="#d97706" />
            <StatCard label="Avg. order value" value={d.avgOrderValue} prefix="GH₵" icon={TrendingUp} accent="#c026d3" />
            <StatCard label="Pending review" value={d.pendingCount} icon={Activity} accent="#0891b2" />
          </section>

          {/* Service performance + Live activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">By service line</p>
                  <p className="font-display text-2xl text-slate-900 mt-0.5">Performance</p>
                </div>
                <Link href="/admin/services" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">All services <ChevronRight className="w-4 h-4" /></Link>
              </div>
              {d.serviceLines.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {d.serviceLines.map((s, i) => {
                    const pct = (s.revenue / d.maxServiceRevenue) * 100;
                    const SIcon = s.meta.icon;
                    return (
                      <div key={s.type} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.meta.color}18`, color: s.meta.color }}>
                              <SIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 leading-tight">{s.meta.name}</p>
                              <p className="text-[11px] text-slate-500">{s.count} booking{s.count === 1 ? "" : "s"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-lg text-slate-900 leading-none">GH₵{s.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full origin-left animate-grow-x" style={{ width: `${pct}%`, background: s.meta.color, animationDelay: `${i * 90}ms` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 overflow-hidden relative">
              <div className="absolute inset-0 admin-grid opacity-30 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-slate-400">Live feed</p>
                    <p className="font-display text-xl mt-0.5 flex items-center gap-2">
                      <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" /><span className="relative rounded-full h-2 w-2 bg-emerald-400" /></span>
                      Happening now
                    </p>
                  </div>
                  <Activity className="w-5 h-5 text-slate-500" />
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {d.recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">Nothing yet — this updates the moment a customer places an order or booking.</p>
                  ) : (
                    d.recentActivity.map((a, i) => {
                      const meta = SERVICE_META[a.type] || { name: a.type, color: "#94a3b8" };
                      const name = `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.trim() || "A customer";
                      return (
                        <div key={a.id} className="flex items-start gap-3 animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-tight">
                              <span className="font-semibold">{name}</span>
                              <span className="text-slate-400"> · {meta.name}{a.summary ? ` · ${a.summary}` : ""}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{timeAgo(a.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Quick actions</p>
            <p className="font-display text-2xl text-slate-900 mb-5">Jump to</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Add product", icon: Package, href: "/admin/products", color: "#2563eb" },
                { label: "Post trip", icon: Plane, href: "/admin/trips", color: "#0891b2" },
                { label: "New deal", icon: Tag, href: "/admin/deals", color: "#d97706" },
                { label: "Customers", icon: Users, href: "/admin/customers", color: "#7c3aed" },
                { label: "Edit content", icon: PenSquare, href: "/admin/content", color: "#059669" },
                { label: "Reports", icon: TrendingUp, href: "/admin/reports", color: "#64748b" },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="group relative overflow-hidden rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:-translate-y-0.5 transition-all">
                  <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: a.color }} />
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${a.color}14`, color: a.color }}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Orders + Bookings */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">Marketplace</p>
                  <p className="font-display text-xl text-slate-900">Recent orders</p>
                </div>
                <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {d.recentOrders.length === 0 ? (
                  <p className="px-6 py-8 text-center text-slate-500 text-sm">No orders yet.</p>
                ) : (
                  d.recentOrders.map((o) => (
                    <div key={o.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs">#{o.id.slice(0, 3)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{o.customer?.firstName} {o.customer?.lastName}</p>
                        <p className="text-[12px] text-slate-500 truncate">{o.summary}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">GH₵{(o.total || 0).toLocaleString()}</p>
                        <StatusPill status={o.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-slate-500">Service lines</p>
                  <p className="font-display text-xl text-slate-900">Recent bookings</p>
                </div>
                <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {d.recentBookings.length === 0 ? (
                  <p className="px-6 py-8 text-center text-slate-500 text-sm">No bookings yet.</p>
                ) : (
                  d.recentBookings.map((b) => {
                    const meta = SERVICE_META[b.type] || { name: b.type };
                    return (
                      <div key={b.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/60 transition">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs">#{b.id.slice(0, 3)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{b.customer?.firstName} {b.customer?.lastName}</p>
                          <p className="text-[12px] text-slate-500 truncate">{meta.name}{b.summary ? ` · ${b.summary}` : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">{b.total ? `GH₵${b.total.toLocaleString()}` : "Quote"}</p>
                          <StatusPill status={b.status} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <footer className="pt-4 pb-8 text-center text-xs text-slate-400">
            Founders &amp; Footsteps · Control Room · {new Date().getFullYear()}
            {d.lastUpdated && <> · Updated {d.lastUpdated.toLocaleTimeString()}</>}
          </footer>
        </main>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-50 text-emerald-700",
    accepted: "bg-emerald-50 text-emerald-700",
    reviewed: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
  };
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] || map.pending}`}>{status}</span>;
}

export default function AdminPage() {
  const { user, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center font-display font-black text-xl animate-pulse">F</div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Authenticating session</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginPortal />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}
