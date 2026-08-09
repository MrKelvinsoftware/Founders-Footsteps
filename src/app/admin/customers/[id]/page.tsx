"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, ShoppingBag, Calendar, Clock, DollarSign, ChevronRight, CheckCircle2, User } from "lucide-react";
import { getSubmissions, type Submission, type SubmissionStatus, updateSubmissionStatus } from "@/lib/submissions";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  reviewed: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const email = decodeURIComponent(id as string);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
    return {
      name: `${latest.customer?.firstName} ${latest.customer?.lastName}`,
      email: latest.customer?.email,
      phone: latest.customer?.phone,
      totalSpent: submissions.reduce((s, b) => s + (b.total || 0), 0),
      orderCount: submissions.length,
    };
  }, [submissions]);

  const setStatus = async (sid: string, status: SubmissionStatus) => {
    setSubmissions(prev => prev.map(s => s.id === sid ? { ...s, status } : s));
    await updateSubmissionStatus(sid, status);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50"><p className="text-slate-500 animate-pulse">Loading customer profile…</p></div>;
  if (!customer) return <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50"><p className="text-slate-500 mb-4">Customer not found.</p><Link href="/admin/customers" className="btn-primary px-6 py-2">Back to list</Link></div>;

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-6 py-4">
          <Link href="/admin/customers" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">Customer Profile</p>
            <h1 className="font-display text-2xl text-slate-900 leading-none">{customer.name}</h1>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-display text-2xl font-bold">
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
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Requests</p>
            <p className="font-display text-3xl text-slate-900">{customer.orderCount}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="font-display text-xl text-slate-900 mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Email Address</p>
                <p className="font-medium text-slate-900">{customer.email}</p>
                <a href={`mailto:${customer.email}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">Send email →</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Phone Number</p>
                <p className="font-medium text-slate-900">{customer.phone || "Not provided"}</p>
                {customer.phone && <a href={`tel:${customer.phone}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">Call customer →</a>}
              </div>
            </div>
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
                      <span className="text-xs text-slate-500">{new Date(s.createdAt).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
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
    </div>
  );
}
