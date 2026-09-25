"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, ShoppingBag, Calendar, Users } from "lucide-react";
import { getSubmissions, type Submission } from "@/lib/submissions";

const TYPE_META: Record<string, { label: string; color: string }> = {
  marketplace: { label: "Marketplace", color: "#ef4444" },
  construction: { label: "Construction", color: "#64748b" },
  event: { label: "Events", color: "#d97706" },
  travel: { label: "Travel", color: "#0891b2" },
  salon: { label: "Salon", color: "#c026d3" },
  logistics: { label: "Logistics", color: "#059669" },
  "tech-repair": { label: "Tech Repairs", color: "#7c3aed" },
  "car-rental": { label: "Car Rental", color: "#2563eb" },
};

type ReportData = {
  all: Submission[];
  rows: { type: string; count: number; revenue: number; meta: { label: string; color: string } }[];
  max: number;
  totalRevenue: number;
  paidOrders: number;
  uniqueCustomers: number;
};

const EMPTY_DATA: ReportData = { all: [], rows: [], max: 1, totalRevenue: 0, paidOrders: 0, uniqueCustomers: 0 };

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getSubmissions();
      const byType: Record<string, { count: number; revenue: number }> = {};
      let totalRevenue = 0;
      let paidOrders = 0;
      for (const s of all) {
        const t = s.type;
        byType[t] = byType[t] || { count: 0, revenue: 0 };
        byType[t].count += 1;
        byType[t].revenue += s.total || 0;
        totalRevenue += s.total || 0;
        if (s.total && s.total > 0) paidOrders += 1;
      }
      const rows = Object.entries(byType).map(([type, v]) => ({ type, ...v, meta: TYPE_META[type] || { label: type, color: "#475569" } })).sort((a, b) => b.revenue - a.revenue);
      const max = Math.max(1, ...rows.map((r) => r.revenue));
      const uniqueCustomers = new Set(all.map((s) => s.customer?.email).filter(Boolean)).size;
      setData({ all, rows, max, totalRevenue, paidOrders, uniqueCustomers });
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-6 py-4">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div><p className="text-[11px] uppercase tracking-[0.28em] text-violet-600 font-semibold">Analytics</p><h1 className="font-display text-2xl text-slate-900 leading-none">Reports</h1></div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Total revenue" value={`GH₵${data.totalRevenue.toLocaleString()}`} icon={TrendingUp} />
          <Stat label="Paid orders" value={data.paidOrders.toString()} icon={ShoppingBag} />
          <Stat label="Total requests" value={data.all.length.toString()} icon={Calendar} />
          <Stat label="Unique customers" value={data.uniqueCustomers.toString()} icon={Users} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-display text-xl text-slate-900 mb-5">Revenue by service line</h2>
          {loading ? (
            <p className="text-slate-500 text-sm py-8 text-center">Loading…</p>
          ) : data.rows.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No activity yet. Place a test order from the storefront to see it here.</p>
          ) : (
            <div className="space-y-4">
              {data.rows.map((r, i) => (
                <div key={r.type}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-800 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: r.meta.color }} /> {r.meta.label} <span className="text-slate-400 text-xs">· {r.count} orders</span></span>
                    <span className="font-display text-slate-900">GH₵{r.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full origin-left animate-[growX_1s_ease]" style={{ width: `${(r.revenue / data.max) * 100}%`, background: r.meta.color, animationDelay: `${i * 80}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-display text-xl text-slate-900">Recent activity</h2></div>
          <div className="divide-y divide-slate-100">
            {data.all.slice(0, 12).map((s) => (
              <div key={s.id} className="px-6 py-3.5 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{s.summary || s.type}</p>
                  <p className="text-xs text-slate-500">{`${s.customer?.firstName || ""} ${s.customer?.lastName || ""}`.trim() || s.customer?.email || "Guest"} · {new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-slate-900">{s.total ? `GH₵${s.total.toLocaleString()}` : "Quote"}</p>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">{s.status}</span>
                </div>
              </div>
            ))}
            {data.all.length === 0 && <p className="px-6 py-8 text-center text-slate-500 text-sm">Nothing yet.</p>}
          </div>
        </div>
      </main>

      <style jsx global>{`@keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <Icon className="w-5 h-5 text-violet-600 mb-3" />
      <p className="font-display text-2xl text-slate-900 leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}
