"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, FileText, Send, Download, Printer,
  Eye, Trash2, Filter, CheckCircle, Clock, XCircle, RefreshCw,
  Building2, Plane, PartyPopper, Wrench, ChevronDown
} from "lucide-react";

type Receipt = {
  id: string;
  receiptNumber: string;
  type: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  currency: string;
  title: string;
  createdAt: string;
  sentAt: string | null;
  paidAt: string | null;
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  construction_estimate: { label: "Construction Estimate", icon: <Building2 className="w-4 h-4" />, color: "bg-slate-600" },
  trip_ticket: { label: "Trip Ticket", icon: <Plane className="w-4 h-4" />, color: "bg-cyan-600" },
  event_receipt: { label: "Event Receipt", icon: <PartyPopper className="w-4 h-4" />, color: "bg-amber-600" },
  service_receipt: { label: "Service Receipt", icon: <Wrench className="w-4 h-4" />, color: "bg-purple-600" },
  order_receipt: { label: "Order Receipt", icon: <FileText className="w-4 h-4" />, color: "bg-emerald-600" },
};

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminPOSPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState<string>("");

  const loadReceipts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pos");
      const data = await res.json();
      if (data.ok) setReceipts(data.receipts || []);
    } catch (e) {
      console.error("Failed to load receipts:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [loadReceipts]);

  const filtered = receipts.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !r.receiptNumber.toLowerCase().includes(q) &&
        !r.customerName?.toLowerCase().includes(q) &&
        !r.title?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const handleCreateNew = (type: string) => {
    setNewType(type);
    // Navigate to the appropriate creation page
    window.location.href = `/admin/pos/create?type=${type}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">Point of Sale</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Receipts & Invoices</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">{receipts.length} total</span>
            <div className="relative">
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-emerald-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Receipt
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search receipts…"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">All Types</option>
            {Object.entries(typeLabels).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      <main className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No receipts yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first receipt to get started with the POS system.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-emerald-600"
            >
              Create Receipt
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Receipt #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Title</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const typeInfo = typeLabels[r.type] || { label: r.type, icon: <FileText className="w-4 h-4" />, color: "bg-slate-600" };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold text-slate-900">{r.receiptNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">{r.customerName || "—"}</p>
                        <p className="text-xs text-slate-500">{r.customerPhone || r.customerEmail || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-700 line-clamp-1">{r.title || "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-900">
                          {r.currency} {parseFloat(r.total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[r.status] || "bg-slate-100 text-slate-700"}`}>
                          {r.status === "paid" && <CheckCircle className="w-3 h-3" />}
                          {r.status === "sent" && <Send className="w-3 h-3" />}
                          {r.status === "draft" && <Clock className="w-3 h-3" />}
                          {r.status === "cancelled" && <XCircle className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/pos/${r.id}`}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/pos/${r.id}/print`}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Print"
                            target="_blank"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* New Receipt Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-display text-xl text-slate-900">Create New Receipt</h2>
              <p className="text-sm text-slate-500">Select the type of document you want to create</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCreateNew("construction_estimate")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-slate-600 text-white flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Construction Estimate</p>
                  <p className="text-xs text-slate-500">Project quotes & estimates</p>
                </div>
              </button>
              
              <button
                onClick={() => handleCreateNew("trip_ticket")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Trip Ticket</p>
                  <p className="text-xs text-slate-500">Boarding pass style</p>
                </div>
              </button>
              
              <button
                onClick={() => handleCreateNew("event_receipt")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Event Receipt</p>
                  <p className="text-xs text-slate-500">Catering & events</p>
                </div>
              </button>
              
              <button
                onClick={() => handleCreateNew("service_receipt")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Service Receipt</p>
                  <p className="text-xs text-slate-500">General services</p>
                </div>
              </button>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowNewModal(false)}
                className="w-full px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
