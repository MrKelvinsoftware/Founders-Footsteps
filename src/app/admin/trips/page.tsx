"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit3, Trash2, X, Save, Check, Plane, Calendar, Users } from "lucide-react";
import { addCustom, updateCustom, removeCustom, getCustom, uid, slugify } from "@/lib/contentStore";
import ImageUpload from "@/components/ImageUpload";

export type Trip = {
  id: string;
  name: string;
  slug: string;
  duration: string;
  price: number;
  departureDate: string;
  availableSlots: number;
  rating: number;
  reviews: number;
  image: string;
  description?: string;
  includes: string[];
  itinerary: string[];
  _custom?: boolean;
};

type FormState = Omit<Trip, "id" | "_custom"> & { id: string };

const empty = (): FormState => ({
  id: "", name: "", slug: "", duration: "5 Days / 4 Nights", price: 5000,
  departureDate: "", availableSlots: 12, rating: 4.8, reviews: 0, image: "",
  description: "", includes: ["Return Flight Tickets", "Hotel Accommodation", "Daily Breakfast", "Airport Transfers", "Travel Insurance"],
  itinerary: [],
});

export default function AdminTripsPage() {
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty());
  const [incDraft, setIncDraft] = useState("");
  const [itinDraft, setItinDraft] = useState("");
  const [toast, setToast] = useState("");

  const trips = useMemo(() => getCustom<Trip>("trips"), [tick]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const openNew = () => { setForm(empty()); setOpen(true); };
  const openEdit = (t: Trip) => { setForm({ ...t }); setOpen(true); };

  const save = () => {
    if (!form.name.trim() || !form.image || !form.departureDate) {
      flash("Name, image and departure date are required.");
      return;
    }
    const payload: Trip = { ...form, id: form.id || uid("trip"), slug: form.slug || slugify(form.name), _custom: true };
    try {
      if (form.id && trips.some((t) => t.id === form.id)) updateCustom("trips", payload);
      else addCustom("trips", payload);
      setOpen(false);
      setTick((t) => t + 1);
      flash("Trip published to /services/travel-trips");
    } catch (e: any) {
      flash(e?.message || "Could not save.");
    }
  };

  const del = (t: Trip) => {
    if (!confirm(`Delete "${t.name}"?`)) return;
    removeCustom("trips", t.id);
    setTick((t) => t + 1);
    flash("Deleted.");
  };

  const addInc = () => { if (incDraft.trim()) { setForm({ ...form, includes: [...form.includes, incDraft.trim()] }); setIncDraft(""); } };
  const addItin = () => { if (itinDraft.trim()) { setForm({ ...form, itinerary: [...form.itinerary, itinDraft.trim()] }); setItinDraft(""); } };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-600 font-semibold">Travel desk</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Trips</h1>
            </div>
          </div>
          <button onClick={openNew} className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-cyan-500 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New trip
          </button>
        </div>
      </header>

      <main className="p-6">
        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center">
            <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-display text-2xl text-slate-900">No custom trips yet</p>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">Publish a trip and it will appear instantly on the Travel & Trips page for customers to book.</p>
            <button onClick={openNew} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-cyan-500 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create your first trip</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((t) => (
              <div key={t.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider">Custom</span>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-cyan-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => del(t)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Departs {t.departureDate}</p>
                  <h3 className="font-display text-lg text-slate-900 mt-1">{t.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t.duration}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="font-display text-lg text-cyan-600">GH₵{t.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> {t.availableSlots} slots</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-[slideInRight_.3s_ease]">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-600 font-semibold">{form.id ? "Edit" : "New"} trip</p>
                <h2 className="font-display text-xl text-slate-900 leading-none mt-1">{form.name || "Untitled trip"}</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-5">
              <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Hero image" />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Trip name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" placeholder="Dubai Luxury Escape" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Duration</label>
                  <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" placeholder="5 Days / 4 Nights" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Departure date</label>
                  <input type="date" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Price per person (GH₵)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Available slots</label>
                  <input type="number" value={form.availableSlots} onChange={(e) => setForm({ ...form, availableSlots: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Short description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500 resize-none" placeholder="What makes this trip special?" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">Package includes</label>
                <div className="flex gap-2 mb-2">
                  <input value={incDraft} onChange={(e) => setIncDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInc())} placeholder="e.g. Desert Safari" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                  <button type="button" onClick={addInc} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.includes.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">
                      {s}
                      <button type="button" onClick={() => setForm({ ...form, includes: form.includes.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">Daily itinerary</label>
                <div className="flex gap-2 mb-2">
                  <input value={itinDraft} onChange={(e) => setItinDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItin())} placeholder="Day 1: Arrival & check-in" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                  <button type="button" onClick={addItin} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">Add</button>
                </div>
                <div className="space-y-1">
                  {form.itinerary.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-sm">
                      <span className="text-slate-400 font-mono text-xs">#{i + 1}</span>
                      <span className="flex-1 text-slate-700">{s}</span>
                      <button type="button" onClick={() => setForm({ ...form, itinerary: form.itinerary.filter((_, j) => j !== i) })}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={save} className="flex-1 px-4 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-cyan-500 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Publish trip</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[rise_.3s_ease]">
          <Check className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
