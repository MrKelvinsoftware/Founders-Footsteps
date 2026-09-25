"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Search, Filter, CheckCircle2, Clock, XCircle, Eye, Truck, ShoppingCart, Calendar } from "lucide-react";
import { getSubmissions, updateSubmissionStatus, type Submission, type SubmissionStatus } from "@/lib/submissions";

const statusStyle: Record<SubmissionStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusIcon: Record<SubmissionStatus, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  reviewed: <Eye className="w-3 h-3" />,
  accepted: <CheckCircle2 className="w-3 h-3" />,
  completed: <Truck className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | SubmissionStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = async () => {
    setLoading(true);
    const all = await getSubmissions({ type: "marketplace" });
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const setStatus = async (id: string, status: SubmissionStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected({ ...selected, status });
    await updateSubmissionStatus(id, status);
  };

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (query && !JSON.stringify(o).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    reviewed: orders.filter((o) => o.status === "reviewed").length,
    accepted: orders.filter((o) => o.status === "accepted").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Marketplace</p>
              <h1 className="font-display text-2xl text-slate-900">Orders</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders…"
                className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 text-sm w-64"
              />
            </div>
            <button className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm flex items-center gap-2 hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {(["all", "pending", "reviewed", "accepted", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap flex items-center gap-2 transition ${
                filter === s ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>{counts[s]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 py-20 text-center">
            <p className="text-slate-500">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-900">No orders yet</p>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">When customers place orders from the marketplace, they&apos;ll appear here in real time.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left px-6 py-3">Order</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Items</th>
                  <th className="text-left px-6 py-3">Total</th>
                  <th className="text-left px-6 py-3">Placed</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">#{o.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{o.customer?.firstName} {o.customer?.lastName}</p>
                      <p className="text-xs text-slate-500">{o.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{o.summary || "—"}</td>
                    <td className="px-6 py-4 font-display text-slate-900">GH₵{(o.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[o.status]}`}>
                        {statusIcon[o.status]} {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelected(o)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-500">Order</p>
                <p className="font-display text-xl text-slate-900">#{selected.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg"><XCircle className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-slate-500 text-xs">Customer</p><p className="font-semibold">{selected.customer?.firstName} {selected.customer?.lastName}</p></div>
                <div><p className="text-slate-500 text-xs">Email</p><p className="font-semibold">{selected.customer?.email}</p></div>
                <div><p className="text-slate-500 text-xs">Phone</p><p className="font-semibold">{selected.customer?.phone}</p></div>
                <div><p className="text-slate-500 text-xs">Placed</p><p className="font-semibold">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Items</p>
                <p className="text-slate-900">{selected.summary}</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
                <span>Total</span>
                <span className="font-display text-2xl">GH₵{(selected.total || 0).toLocaleString()}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Update status</p>
                <div className="grid grid-cols-5 gap-2">
                  {(["pending", "reviewed", "accepted", "completed", "rejected"] as SubmissionStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(selected.id, s)}
                      className={`text-xs py-2 rounded-lg border capitalize ${selected.status === s ? statusStyle[s] : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
