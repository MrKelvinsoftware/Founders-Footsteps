"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Package, Globe, MapPin, Calendar, Shield, CheckCircle, ArrowRight, Plane, Ship } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

const services = [
  { icon: Truck, title: "Domestic Delivery", desc: "Same-day and next-day delivery across all 16 regions of Ghana.", color: "#2563eb" },
  { icon: Globe, title: "International Shipping", desc: "Worldwide air & sea freight with door-to-door tracking.", color: "#0891b2" },
  { icon: Package, title: "Warehousing", desc: "Climate-controlled storage facilities in Accra, Tema & Kumasi.", color: "#059669" },
  { icon: Shield, title: "Cargo Insurance", desc: "Full-value coverage on every shipment, no exceptions.", color: "#7c3aed" },
  { icon: Plane, title: "Air Freight", desc: "Express air cargo to 200+ destinations worldwide.", color: "#d97706" },
  { icon: Ship, title: "Sea Freight", desc: "FCL & LCL container shipping with port-to-port service.", color: "#c026d3" },
];

const rates = [
  { service: "Domestic (Same-day)", within: "Accra", price: 80, eta: "6 hrs" },
  { service: "Domestic (Next-day)", within: "Accra ↔ Kumasi", price: 150, eta: "24 hrs" },
  { service: "Domestic (Express)", within: "Accra ↔ Tamale", price: 220, eta: "48 hrs" },
  { service: "International (Air)", within: "Accra ↔ London", price: 850, eta: "3-5 days" },
  { service: "International (Air)", within: "Accra ↔ Dubai", price: 720, eta: "2-4 days" },
  { service: "International (Sea)", within: "Tema ↔ Shanghai", price: 1800, eta: "30-40 days" },
];

export default function LogisticsPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    service: "Domestic Delivery",
    pickup: "", dropoff: "",
    weight: "", dimensions: "",
    date: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addSubmission({
      type: "logistics",
      total: 0,
      currency: "GHS",
      customer: { firstName: form.name.split(" ")[0] || "Guest", lastName: form.name.split(" ").slice(1).join(" "), email: form.email, phone: form.phone },
      summary: `${form.service} · ${form.pickup} → ${form.dropoff} · ${form.weight}kg`,
      payload: { kind: "logistics", service: form.service, pickup: form.pickup, dropoff: form.dropoff, weight: form.weight, dimensions: form.dimensions, date: form.date, company: form.company, notes: form.notes },
    });
    if (res) {
      setSubmitted(true);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200 font-semibold mb-3">Global Logistics</p>
            <h1 className="font-display text-5xl md:text-6xl mb-4 leading-[1.05]">Move anything, anywhere.</h1>
            <p className="text-white/80 text-lg">Domestic and international freight, warehousing, and last-mile delivery. Real-time tracking on every shipment.</p>
          </div>

          {/* Quick quote */}
          <div className="bg-white rounded-3xl p-6 mt-10 shadow-2xl">
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <select name="service" value={form.service} onChange={handle} className="px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm">
                {services.map(s => <option key={s.title}>{s.title}</option>)}
              </select>
              <input name="pickup" value={form.pickup} onChange={handle} placeholder="Pickup location" className="px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              <input name="dropoff" value={form.dropoff} onChange={handle} placeholder="Drop-off location" className="px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              <input name="weight" value={form.weight} onChange={handle} placeholder="Weight (kg)" className="px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              <input type="date" name="date" value={form.date} onChange={handle} className="px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              <button type="submit" className="px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2">
                Get a quote <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <ServiceInfoBanner slug="logistics" />

      {/* Service grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl text-slate-900 mb-3">What we move</h2>
          <p className="text-lg text-slate-600">Six service lines, one trusted partner.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-white rounded-2xl p-7 hover:shadow-xl transition-shadow border border-slate-100">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rate card */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl text-slate-900">Indicative rates</h2>
              <p className="text-slate-500 text-sm">Get a binding quote in minutes via the form above</p>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">In Ghana Cedis (GH₵)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left px-8 py-3">Service</th>
                  <th className="text-left px-4 py-3">Route</th>
                  <th className="text-left px-4 py-3">ETA</th>
                  <th className="text-right px-8 py-3">From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rates.map((r) => (
                  <tr key={r.service + r.within}>
                    <td className="px-8 py-4 font-medium text-slate-900">{r.service}</td>
                    <td className="px-4 py-4 text-slate-700">{r.within}</td>
                    <td className="px-4 py-4 text-slate-500">{r.eta}</td>
                    <td className="px-8 py-4 text-right font-display text-slate-900">GH₵{r.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="container mx-auto px-4 py-12 pb-20">
        <div className="bg-slate-900 rounded-3xl p-10 lg:p-16 text-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300 font-semibold mb-3">Need a custom logistics plan?</p>
            <h2 className="font-display text-3xl md:text-4xl mb-4">Speak with our freight specialists</h2>
            <p className="text-white/70 leading-relaxed">Bulk shipments, recurring routes, customs clearance — our team handles the heavy lifting so you don't have to.</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input required placeholder="Full name" value={form.name} onChange={handle} name="name" className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60" />
            <div className="grid grid-cols-2 gap-3">
              <input required type="email" placeholder="Email" name="email" value={form.email} onChange={handle} className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60" />
              <input required type="tel" placeholder="Phone" name="phone" value={form.phone} onChange={handle} className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60" />
            </div>
            <textarea placeholder="Tell us about your shipment" name="notes" value={form.notes} onChange={handle} rows={3} className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 resize-none" />
            <button onClick={submit} className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Send request</button>
          </div>
        </div>
      </section>

      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Request received</h3>
            <p className="text-slate-600 mb-5">Our logistics team will reply within 4 business hours with a binding quote.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
