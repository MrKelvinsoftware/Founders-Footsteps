"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Search, Mail, Phone, User, ShoppingBag, Calendar,
  Send, Trash2, AlertTriangle, Clock, CheckCircle, X, RefreshCw,
  MessageSquare, Filter, ChevronDown
} from "lucide-react";
import { adminFetch } from "@/lib/adminFetch";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: boolean;
  orderCount: number;
  totalSpent: number;
  lastActivity: string;
  createdAt: string;
  accountAgeDays: number;
  daysSinceActivity: number;
  isInactive: boolean;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      
      const res = await adminFetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.ok) {
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error("Failed to load customers:", e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const sendMessage = async () => {
    if (!selectedCustomer || !messageTitle.trim() || !messageBody.trim()) {
      flash("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const res = await adminFetch("/api/admin/customers", {
        method: "POST",
        body: JSON.stringify({
          action: "send_message",
          userId: selectedCustomer.id,
          title: messageTitle,
          message: messageBody,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        flash(`Message sent to ${selectedCustomer.name}`);
        setShowMessageModal(false);
        setMessageTitle("");
        setMessageBody("");
        setSelectedCustomer(null);
      } else {
        flash("Failed to send message");
      }
    } catch (e) {
      flash("Error sending message");
    } finally {
      setSending(false);
    }
  };

  const deleteCustomer = async () => {
    if (!selectedCustomer) return;

    setSending(true);
    try {
      const res = await adminFetch("/api/admin/customers", {
        method: "POST",
        body: JSON.stringify({
          action: "delete_user",
          userId: selectedCustomer.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        flash(`Customer ${selectedCustomer.name} deleted`);
        setShowDeleteModal(false);
        setSelectedCustomer(null);
        loadCustomers();
      } else {
        flash("Failed to delete customer");
      }
    } catch (e) {
      flash("Error deleting customer");
    } finally {
      setSending(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (filter === "active" && c.isInactive) return false;
    if (filter === "inactive" && !c.isInactive) return false;
    return true;
  });

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const inactiveCount = customers.filter((c) => c.isInactive).length;

  const formatDaysAgo = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const formatAccountAge = (days: number) => {
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${(days / 365).toFixed(1)} years`;
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">People</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Customers</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone…"
                className="pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm w-72 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-3 py-2 rounded-lg bg-slate-100 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="all">All Customers</option>
              <option value="active">Active (90 days)</option>
              <option value="inactive">Inactive (90+ days)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Stat label="Total Customers" value={customers.length.toString()} icon={User} />
          <Stat label="Active" value={(customers.length - inactiveCount).toString()} icon={CheckCircle} color="text-emerald-600" />
          <Stat label="Inactive (90+ days)" value={inactiveCount.toString()} icon={Clock} color="text-amber-600" />
          <Stat label="Total Orders" value={customers.reduce((s, c) => s + c.orderCount, 0).toString()} icon={ShoppingBag} />
          <Stat label="Revenue" value={`GH₵${totalRevenue.toLocaleString()}`} icon={Calendar} color="text-emerald-600" />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Loading customers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center">
            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-900">
              {searchQuery ? "No customers found" : "No customers yet"}
            </p>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              {searchQuery 
                ? "Try a different search term"
                : "As people sign up and place orders, their profiles appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Contact</th>
                  <th className="text-center px-4 py-3">Account Age</th>
                  <th className="text-center px-4 py-3">Last Activity</th>
                  <th className="text-right px-4 py-3">Orders</th>
                  <th className="text-right px-4 py-3">Spent</th>
                  <th className="text-center px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50/60 group ${c.isInactive ? "bg-amber-50/30" : ""}`}>
                    <td className="px-6 py-4">
                      <Link href={`/admin/customers/${encodeURIComponent(c.email)}`} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                          c.isInactive 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200"
                        }`}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                            {c.name}
                            {c.isInactive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700">
                                Inactive
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{c.role}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[180px]">{c.email}</span>
                      </p>
                      <p className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.phone || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="font-medium text-slate-900">{formatAccountAge(c.accountAgeDays)}</p>
                      <p className="text-[10px] text-slate-500">since signup</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className={`font-medium ${c.daysSinceActivity > 90 ? "text-amber-600" : c.daysSinceActivity > 30 ? "text-slate-600" : "text-emerald-600"}`}>
                        {formatDaysAgo(c.daysSinceActivity)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(c.lastActivity).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900">{c.orderCount}</td>
                    <td className="px-4 py-4 text-right font-display text-emerald-600">
                      GH₵{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setSelectedCustomer(c); setShowMessageModal(true); }}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${c.email}`}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
                            title="WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedCustomer(c); setShowDeleteModal(true); }}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Send Message Modal */}
      {showMessageModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-slate-900">Send Direct Message</h2>
                <p className="text-sm text-slate-500">To: {selectedCustomer.name} ({selectedCustomer.email})</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                  Subject
                </label>
                <input
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Message subject..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                  Message
                </label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Write your message..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={sending}
                className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-display text-xl text-slate-900 mb-2">Delete Customer?</h2>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete <strong>{selectedCustomer.name}</strong>?
              </p>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-left mb-4">
                <p className="text-slate-600"><strong>Email:</strong> {selectedCustomer.email}</p>
                <p className="text-slate-600"><strong>Account age:</strong> {formatAccountAge(selectedCustomer.accountAgeDays)}</p>
                <p className="text-slate-600"><strong>Last activity:</strong> {formatDaysAgo(selectedCustomer.daysSinceActivity)}</p>
                <p className="text-slate-600"><strong>Total orders:</strong> {selectedCustomer.orderCount}</p>
              </div>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={deleteCustomer}
                disabled={sending}
                className="px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[rise_.3s_ease]">
          <CheckCircle className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color = "text-slate-600" }: { 
  label: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      <p className="font-display text-2xl text-slate-900 leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-slate-500 mt-1.5">{label}</p>
    </div>
  );
}
