"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Mail, Phone, User, ShoppingBag, Calendar } from "lucide-react";
import { getSubmissions } from "@/lib/submissions";

type Customer = {
  key: string; name: string; email: string; phone: string;
  orders: number; spent: number; lastSeen: string; types: string[];
};

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const submissions = await getSubmissions();
      const map = new Map<string, Customer>();
      for (const s of submissions) {
        const email = (s.customer?.email || "").toLowerCase();
        if (!email) continue;
        const key = email;
        const cur = map.get(key) || {
          key, name: `${s.customer?.firstName || ""} ${s.customer?.lastName || ""}`.trim() || email,
          email, phone: s.customer?.phone || "", orders: 0, spent: 0, lastSeen: s.createdAt, types: [],
        };
        cur.orders += 1;
        cur.spent += s.total || 0;
        if (s.createdAt > cur.lastSeen) cur.lastSeen = s.createdAt;
        if (!cur.types.includes(s.type)) cur.types.push(s.type);
        if (s.customer?.phone && !cur.phone) cur.phone = s.customer.phone;
        map.set(key, cur);
      }
      setCustomers([...map.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)));
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()));
  const totalRevenue = customers.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div><p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">People</p><h1 className="font-display text-2xl text-slate-900 leading-none">Customers</h1></div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm w-64 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200" />
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Customers" value={customers.length.toString()} icon={User} />
          <Stat label="Total orders" value={customers.reduce((s, c) => s + c.orders, 0).toString()} icon={ShoppingBag} />
          <Stat label="Revenue" value={`GH₵${totalRevenue.toLocaleString()}`} icon={Calendar} />
          <Stat label="Avg. spend" value={`GH₵${customers.length ? Math.round(totalRevenue / customers.length).toLocaleString() : 0}`} icon={Mail} />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <p className="text-slate-500">Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-900">No customers yet</p>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">As people place orders and request quotes, their profiles appear here automatically.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr><th className="text-left px-6 py-3">Customer</th><th className="text-left px-4 py-3">Contact</th><th className="text-left px-4 py-3">Services used</th><th className="text-right px-4 py-3">Orders</th><th className="text-right px-6 py-3">Total spent</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.key} className="hover:bg-slate-50/60 group">
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${encodeURIComponent(c.email)}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm group-hover:bg-emerald-200 transition-colors">{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{c.name}</p>
                          <p className="text-xs text-slate-500">Last seen {new Date(c.lastSeen).toLocaleDateString()}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600"><p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}</p><p className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone || "—"}</p></td>
                    <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{c.types.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] capitalize">{t}</span>)}</div></td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900">{c.orders}</td>
                    <td className="px-6 py-4 text-right font-display text-emerald-600">GH₵{c.spent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <Icon className="w-5 h-5 text-emerald-600 mb-3" />
      <p className="font-display text-2xl text-slate-900 leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}
