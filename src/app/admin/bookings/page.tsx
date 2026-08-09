"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, CheckCircle2, Clock, XCircle, Eye, Calendar,
  Home, Utensils, Scissors, Plane, CalendarCheck, ChevronRight, Truck, Wrench, Car,
} from "lucide-react";
import { getSubmissions, updateSubmissionStatus, type Submission, type SubmissionStatus, type SubmissionType } from "@/lib/submissions";

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
  completed: <CalendarCheck className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

const typeMeta: Record<SubmissionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; accent: string }> = {
  construction: { label: "Construction", icon: Home, color: "#64748b", accent: "bg-slate-100 text-slate-700" },
  event: { label: "Catering & Events", icon: Utensils, color: "#d97706", accent: "bg-amber-50 text-amber-700" },
  salon: { label: "Salon & Beauty", icon: Scissors, color: "#c026d3", accent: "bg-pink-50 text-pink-700" },
  travel: { label: "Travel & Trips", icon: Plane, color: "#0891b2", accent: "bg-cyan-50 text-cyan-700" },
  logistics: { label: "Logistics", icon: Truck, color: "#059669", accent: "bg-emerald-50 text-emerald-700" },
  "tech-repair": { label: "Tech Repairs", icon: Wrench, color: "#7c3aed", accent: "bg-violet-50 text-violet-700" },
  "car-rental": { label: "Car Rental", icon: Car, color: "#2563eb", accent: "bg-blue-50 text-blue-700" },
  marketplace: { label: "Marketplace", icon: Calendar, color: "#059669", accent: "bg-emerald-50 text-emerald-700" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | SubmissionType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | SubmissionStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = async () => {
    setLoading(true);
    const all = await getSubmissions();
    setBookings(all.filter((s) => s.type !== "marketplace"));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => ({
    all: bookings.length,
    construction: bookings.filter((b) => b.type === "construction").length,
    event: bookings.filter((b) => b.type === "event").length,
    salon: bookings.filter((b) => b.type === "salon").length,
    travel: bookings.filter((b) => b.type === "travel").length,
    logistics: bookings.filter((b) => b.type === "logistics").length,
    "tech-repair": bookings.filter((b) => b.type === "tech-repair").length,
    "car-rental": bookings.filter((b) => b.type === "car-rental").length,
  }), [bookings]);

  const setStatus = async (id: string, status: SubmissionStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    if (selected?.id === id) setSelected({ ...selected, status });
    await updateSubmissionStatus(id, status);
  };

  const filtered = bookings.filter((b) => {
    if (filterType !== "all" && b.type !== filterType) return false;
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (query && !JSON.stringify(b).toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-500">Service lines</p>
              <h1 className="font-display text-2xl text-slate-900">Bookings & Requests</h1>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookings…" className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-transparent focus:bg-white focus:border-slate-200 text-sm w-64" />
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8">
        {/* Type filter */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {(["all", "construction", "event", "salon", "travel", "logistics", "tech-repair", "car-rental"] as const).map((t) => {
            const meta = t === "all" ? null : typeMeta[t];
            const Icon = meta?.icon;
            const active = filterType === t;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`p-4 rounded-xl border text-left transition ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  {Icon ? (
                    <span className={active ? "text-white" : ""} style={!active && meta ? { color: meta.color } : undefined}>
                      <Icon className="w-5 h-5" />
                    </span>
                  ) : <Calendar className={`w-5 h-5 ${active ? "text-white" : "text-slate-600"}`} />}
                  <span className={`text-2xl font-display ${active ? "text-white" : "text-slate-900"}`}>{t === "all" ? counts.all : counts[t as keyof typeof counts]}</span>
                </div>
                <p className={`text-sm font-semibold ${active ? "text-white" : "text-slate-900"}`}>{t === "all" ? "All bookings" : meta?.label}</p>
              </button>
            );
          })}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["all", "pending", "reviewed", "accepted", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${filterStatus === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-700"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 py-20 text-center">
            <p className="text-slate-500">Loading bookings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-20 text-center">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-900">No bookings yet</p>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">When a customer submits a request from Construction, Events, Salon, Travel, Logistics, Tech Repairs or Car Rental, it lands here instantly with full details.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((b) => {
              const meta = typeMeta[b.type];
              const Icon = meta.icon;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className="text-left bg-white rounded-2xl border border-slate-200/70 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}18`, color: meta.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold ${meta.accent.split(" ")[1]}`}>{meta.label}</p>
                        <p className="font-display text-lg text-slate-900">{b.summary || b.customer?.firstName}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div><p className="text-[10px] uppercase tracking-widest text-slate-500">Customer</p><p className="font-semibold text-slate-900">{b.customer?.firstName} {b.customer?.lastName}</p></div>
                    <div><p className="text-[10px] uppercase tracking-widest text-slate-500">Placed</p><p className="text-slate-700">{new Date(b.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle[b.status]}`}>
                      {statusIcon[b.status]} {b.status}
                    </span>
                    {b.total ? <span className="font-display text-lg text-slate-900">GH₵{b.total.toLocaleString()}</span> : <span className="text-xs text-slate-500">Estimate pending</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${typeMeta[selected.type].color}18`, color: typeMeta[selected.type].color }}>
                  {(() => { const I = typeMeta[selected.type].icon; return <I className="w-5 h-5" />; })()}
                </div>
                <div>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold ${typeMeta[selected.type].accent.split(" ")[1]}`}>{typeMeta[selected.type].label}</p>
                  <p className="font-display text-xl text-slate-900">#{selected.id.slice(0, 8)}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg"><XCircle className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-slate-500 text-xs">Customer</p><p className="font-semibold">{selected.customer?.firstName} {selected.customer?.lastName}</p></div>
                <div><p className="text-slate-500 text-xs">Phone</p><p className="font-semibold">{selected.customer?.phone}</p></div>
                <div className="col-span-2"><p className="text-slate-500 text-xs">Email</p><p className="font-semibold">{selected.customer?.email}</p></div>
                <div className="col-span-2"><p className="text-slate-500 text-xs">Received</p><p className="font-semibold">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Request details</p>
                {Object.entries(selected.payload).map(([k, v]) => {
                  if (v === "" || v === null || v === undefined) return null;
                  const formatVal = (item: unknown): string => {
                    if (item === null || item === undefined) return "";
                    if (typeof item === "object") {
                      const obj = item as Record<string, unknown>;
                      if (obj.label) return `${obj.label}${obj.price ? ` (GH₵${obj.price})` : ""}`;
                      if (obj.name) return `${obj.name}${obj.price ? ` (GH₵${obj.price})` : ""}`;
                      return Object.entries(obj).map(([subK, subV]) => `${subK}: ${subV}`).join("; ");
                    }
                    return String(item);
                  };
                  const val = Array.isArray(v) ? v.map(formatVal).join(", ") : formatVal(v);
                  if (!val) return null;
                  return (
                    <div key={k} className="flex justify-between gap-4 text-sm">
                      <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="text-slate-900 font-medium text-right">{val}</span>
                    </div>
                  );
                })}
              </div>
              {selected.total ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
                  <span>Estimated total</span>
                  <span className="font-display text-2xl">GH₵{selected.total.toLocaleString()}</span>
                </div>
              ) : null}
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
