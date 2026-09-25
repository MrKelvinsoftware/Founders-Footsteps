"use client";

import { useEffect, useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, ShoppingBag, Calendar, Clock, Send,
  CheckCircle2, User, MessageSquare, Trash2, AlertTriangle, X,
  RefreshCw, ExternalLink
} from "lucide-react";
import { getSubmissions, type Submission, type SubmissionStatus, updateSubmissionStatus } from "@/lib/submissions";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const email = decodeURIComponent(id);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getSubmissions();
      setSubmissions(all.filter(s => s.customer?.email?.toLowerCase() === email.toLowerCase()));
      setLoading(false);
    })();
  }, [email]);

  const customer = useMemo(() => {
    if (submissions.length === 0) return null;
    const latest = submissions[0];
    const oldest = submissions[submissions.length - 1];
    const firstSeen = new Date(oldest.createdAt);
    const lastSeen = new Date(submissions[0].createdAt);
    const accountAgeDays = Math.floor((Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceActivity = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      name: `${latest.customer?.firstName || ""} ${latest.customer?.lastName || ""}`.trim() || email.split("@")[0],
      email: latest.customer?.email,
      phone: latest.customer?.phone,
      totalSpent: submissions.reduce((s, b) => s + (b.total || 0), 0),
      orderCount: submissions.length,
      firstSeen,
      lastSeen,
      accountAgeDays,
      daysSinceActivity,
      isInactive: daysSinceActivity > 90,
    };
  }, [submissions, email]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const setStatus = async (sid: string, status: SubmissionStatus) => {
    setSubmissions(prev => prev.map(s => s.id === sid ? { ...s, status } : s));
    await updateSubmissionStatus(sid, status);
  };

  const sendMessage = async () => {
    if (!messageTitle.trim() || !messageBody.trim()) {
      flash("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      // In a real app, this would send to the user's inbox
      // For now, we'll simulate it
      flash(`Message sent to ${customer?.name}`);
      setShowMessageModal(false);
      setMessageTitle("");
      setMessageBody("");
    } catch (e) {
      flash("Error sending message");
    } finally {
      setSending(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <User className="w-16 h-16 text-slate-300 mb-4" />
        <p className="text-slate-500 mb-4">Customer not found.</p>
        <Link href="/admin/customers" className="px-6 py-2 rounded-full bg-slate-900 text-white font-semibold">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/customers" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">Customer Profile</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none flex items-center gap-2">
                {customer.name}
                {customer.isInactive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                    Inactive
                  </span>
                )}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Send Message
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display text-2xl font-bold ${
              customer.isInactive ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
            }`}>
              {customer.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{customer.name}</h2>
              <p className="text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Lifetime Value</p>
            <p className="font-display text-3xl text-emerald-600">GH₵{customer.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Account Age</p>
            <p className="font-display text-3xl text-slate-900">{formatAccountAge(customer.accountAgeDays)}</p>
            <p className="text-xs text-slate-500">Since {customer.firstSeen.toLocaleDateString()}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Last Activity</p>
            <p className={`font-display text-3xl ${customer.daysSinceActivity > 90 ? "text-amber-600" : "text-slate-900"}`}>
              {formatDaysAgo(customer.daysSinceActivity)}
            </p>
            <p className="text-xs text-slate-500">{customer.lastSeen.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="font-display text-xl text-slate-900 mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Email Address</p>
                <p className="font-medium text-slate-900">{customer.email}</p>
                <a href={`mailto:${customer.email}`} className="text-sm text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                  Send email <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Phone Number</p>
                <p className="font-medium text-slate-900">{customer.phone || "Not provided"}</p>
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="text-sm text-blue-600 hover:underline mt-1 inline-flex items-center gap-1">
                    Call customer <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            {customer.phone && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">WhatsApp</p>
                  <p className="font-medium text-slate-900">{customer.phone}</p>
                  <a 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    Open WhatsApp <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display text-xl text-slate-900">Activity History</h3>
            <span className="text-xs text-slate-500">{submissions.length} total entries</span>
          </div>
          <div className="divide-y divide-slate-100">
            {submissions.map((s) => (
              <div key={s.id} className="p-8 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">{s.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">
                        {new Date(s.createdAt).toLocaleString("en-GB", { 
                          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" 
                        })}
                      </span>
                    </div>
                    <h4 className="font-display text-2xl text-slate-900">{s.summary}</h4>
                    
                    {/* Payload Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 pt-2">
                      {Object.entries(s.payload).map(([k, v]) => {
                        if (v === "" || v === null || v === undefined || k === "kind" || k === "quote") return null;
                        const val = Array.isArray(v) ? v.join(", ") : String(v);
                        return (
                          <div key={k} className="flex justify-between border-b border-slate-100 py-1.5 text-sm">
                            <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                            <span className="text-slate-900 font-medium text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 min-w-[200px]">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Transaction Value</p>
                      <p className="font-display text-2xl text-slate-900">GH₵{(s.total || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="w-full space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Status</p>
                      <div className="flex flex-wrap gap-1">
                        {(["pending", "reviewed", "accepted", "completed", "rejected"] as SubmissionStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => setStatus(s.id, st)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              s.status === st ? statusStyle[st] : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMessageModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-slate-900">Send Direct Message</h2>
                <p className="text-sm text-slate-500">To: {customer.name}</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Subject</label>
                <input
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Message subject..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Message</label>
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-display text-xl text-slate-900 mb-2">Delete Customer?</h2>
              <p className="text-slate-600 mb-4">
                Are you sure you want to delete <strong>{customer.name}</strong>?
              </p>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-left mb-4">
                <p><strong>Account age:</strong> {formatAccountAge(customer.accountAgeDays)}</p>
                <p><strong>Last activity:</strong> {formatDaysAgo(customer.daysSinceActivity)}</p>
                <p><strong>Total orders:</strong> {customer.orderCount}</p>
                <p><strong>Total spent:</strong> GH₵{customer.totalSpent.toLocaleString()}</p>
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
                className="px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
