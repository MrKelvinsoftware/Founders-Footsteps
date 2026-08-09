"use client";

import { useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";

interface Props {
  topic: string;
  buttonLabel: string;
  service?: string;
  className?: string;
  variant?: "solid" | "outline";
}

export default function RequestQuoteModal({ topic, buttonLabel, service, className = "", variant = "solid" }: Props) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "construction",
        total: 0,
        customer: { firstName: form.name.split(" ")[0] || "Guest", lastName: form.name.split(" ").slice(1).join(" "), email: form.email, phone: form.phone },
        summary: `${topic}${service ? ` — ${service}` : ""}: ${form.message.slice(0, 80)}`,
        payload: { topic, service, message: form.message },
      }),
    });
    setDone(true);
  };

  const base = variant === "solid"
    ? "bg-white text-slate-900 hover:bg-slate-100"
    : "border border-white/30 text-white hover:bg-white/10";

  return (
    <>
      <button onClick={() => { setOpen(true); setDone(false); }} className={`${base} ${className}`}>{buttonLabel}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-xl text-slate-900 mb-2">Request sent!</h3>
                <p className="text-slate-600 text-sm">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setOpen(false)} className="mt-4 px-5 py-2 rounded-full bg-slate-900 text-white font-semibold text-sm">Close</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="font-bold text-xl text-slate-900">{topic}</h3>
                {service && <p className="text-sm text-slate-500">{service}</p>}
                <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                <textarea required placeholder="Tell us about your project…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm resize-none" />
                <button type="submit" className="w-full py-3 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Send request</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
