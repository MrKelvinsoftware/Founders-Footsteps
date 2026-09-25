"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, Car, Edit3, Trash2, Eye, EyeOff, X,
  Save, Image as ImageIcon, Tag, Check, Fuel, Users, Settings2, Package
} from "lucide-react";
import {
  addCustom, updateCustom, removeCustom, getCustom, hide, unhide, getHidden, mergeWithSeed, uid, slugify,
} from "@/lib/contentStore";
import ImageUpload from "@/components/ImageUpload";

type CarVehicle = {
  id: string;
  name: string;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  luggage: number;
  daily: number;
  image: string;
  features: string[];
  stock?: number;
};

const seedCars: CarVehicle[] = [
  { id: "eco", name: "Hyundai Accent", category: "Economy", transmission: "Manual", fuel: "Petrol", seats: 5, luggage: 2, daily: 350, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", features: ["AC", "Bluetooth", "Power Windows"], stock: 5 },
  { id: "compact", name: "Toyota Corolla", category: "Compact", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 3, daily: 450, image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80", features: ["AC", "Reverse Camera", "Cruise Control"], stock: 4 },
  { id: "sedan", name: "Toyota Camry", category: "Sedan", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 4, daily: 650, image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80", features: ["AC", "Leather Seats", "Sunroof", "Reverse Camera"], stock: 3 },
  { id: "suv", name: "Toyota RAV4", category: "SUV", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 5, daily: 850, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", features: ["AC", "4WD", "Bluetooth", "Cruise Control"], stock: 3 },
  { id: "luxury", name: "Mercedes-Benz E-Class", category: "Luxury", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 4, daily: 1500, image: "https://images.unsplash.com/photo-1618843479313-6f7a4d6f3f9b?w=800&q=80", features: ["Leather", "Sunroof", "Premium Audio", "Climate Control"], stock: 2 },
  { id: "van", name: "Hyundai H1", category: "Van", transmission: "Automatic", fuel: "Diesel", seats: 9, luggage: 6, daily: 950, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80", features: ["AC", "9 Seater", "Large Luggage"], stock: 2 },
];

const categories = ["Economy", "Compact", "Sedan", "SUV", "Luxury", "Van"];
const transmissions = ["Manual", "Automatic"];
const fuels = ["Petrol", "Diesel", "Electric", "Hybrid"];

type FormState = {
  id: string;
  name: string;
  category: string;
  transmission: string;
  fuel: string;
  seats: string;
  luggage: string;
  daily: string;
  image: string;
  features: string[];
  stock: string;
};

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  category: "Economy",
  transmission: "Automatic",
  fuel: "Petrol",
  seats: "5",
  luggage: "2",
  daily: "",
  image: "",
  features: [],
  stock: "5",
});

export default function AdminCarsPage() {
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [toast, setToast] = useState<string>("");
  const [featureInput, setFeatureInput] = useState("");

  const custom = useMemo(() => getCustom<CarVehicle>("cars"), [tick]);
  const hidden = useMemo(() => getHidden("cars"), [tick]);
  const all = useMemo(() => mergeWithSeed(seedCars, "cars" as any) as CarVehicle[], [tick]);

  const filtered = all.filter((c) => {
    if (catFilter !== "all" && c.category !== catFilter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const openNew = () => {
    setForm(emptyForm());
    setDrawerOpen(true);
  };
  
  const openEdit = (c: CarVehicle) => {
    setForm({
      id: c.id,
      name: c.name,
      category: c.category,
      transmission: c.transmission,
      fuel: c.fuel,
      seats: String(c.seats),
      luggage: String(c.luggage),
      daily: String(c.daily),
      image: c.image,
      features: c.features || [],
      stock: String(c.stock ?? 5),
    });
    setDrawerOpen(true);
  };

  const addFeature = () => {
    if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
      setForm({ ...form, features: [...form.features, featureInput.trim()] });
      setFeatureInput("");
    }
  };

  const removeFeature = (f: string) => {
    setForm({ ...form, features: form.features.filter(x => x !== f) });
  };

  const save = () => {
    if (!form.name.trim() || !form.daily.trim() || !form.image) {
      flash("Name, daily rate and image are required.");
      return;
    }
    const payload: CarVehicle = {
      id: form.id || uid("car"),
      name: form.name.trim(),
      category: form.category,
      transmission: form.transmission,
      fuel: form.fuel,
      seats: parseInt(form.seats) || 5,
      luggage: parseInt(form.luggage) || 2,
      daily: parseFloat(form.daily) || 0,
      image: form.image,
      features: form.features,
      stock: parseInt(form.stock) || 5,
    };
    try {
      if (form.id && custom.some((c) => c.id === form.id)) updateCustom("cars" as any, payload);
      else addCustom("cars" as any, payload);
      setDrawerOpen(false);
      setTick((t) => t + 1);
      flash("Vehicle saved successfully.");
    } catch (e: any) {
      flash(e?.message || "Could not save.");
    }
  };

  const onDelete = (c: CarVehicle) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    removeCustom("cars" as any, c.id);
    setTick((t) => t + 1);
    flash("Deleted.");
  };
  
  const onHide = (c: CarVehicle) => {
    if (hidden.includes(c.id)) unhide("cars" as any, c.id);
    else hide("cars" as any, c.id);
    setTick((t) => t + 1);
  };

  const updateStock = (c: CarVehicle, delta: number) => {
    const newStock = Math.max(0, (c.stock ?? 5) + delta);
    const updated = { ...c, stock: newStock };
    if (custom.some(x => x.id === c.id)) {
      updateCustom("cars" as any, updated);
    } else {
      addCustom("cars" as any, updated);
    }
    setTick(t => t + 1);
    flash(`Stock updated to ${newStock}`);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/services" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-blue-600 font-semibold">Car Services CMS</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Vehicles</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">{all.length} vehicles · {custom.length} custom</span>
            <button onClick={openNew} className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add vehicle
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <button onClick={() => setCatFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>All</button>
            {categories.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{c}</button>
            ))}
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const isCustom = custom.some((x) => x.id === c.id);
            const isHidden = hidden.includes(c.id);
            const stock = c.stock ?? 5;
            return (
              <div key={c.id} className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all ${isHidden ? "opacity-50" : ""}`}>
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 text-slate-900 text-[10px] font-bold uppercase tracking-wider">{c.category}</span>
                    {isCustom && <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider">Custom</span>}
                    {isHidden && <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">Hidden</span>}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} title="Edit" className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onHide(c)} title={isHidden ? "Show" : "Hide"} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-900 hover:text-white">{isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    {isCustom && <button onClick={() => onDelete(c)} title="Delete" className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-slate-900 mb-1">{c.name}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> {c.transmission}</span>
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {c.fuel}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.seats}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {c.luggage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xl text-blue-600">GH₵{c.daily.toLocaleString()}<span className="text-sm text-slate-500">/day</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateStock(c, -1)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-sm">−</button>
                      <span className={`w-10 text-center text-sm font-semibold ${stock === 0 ? "text-red-600" : "text-slate-700"}`}>{stock}</span>
                      <button onClick={() => updateStock(c, 1)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 text-sm">+</button>
                    </div>
                  </div>
                  {stock === 0 && <p className="text-xs text-red-600 mt-1 font-medium">Out of stock</p>}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-slate-900">{form.id ? "Edit Vehicle" : "New Vehicle"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Vehicle Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Toyota Camry 2024" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none">
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Transmission</label>
                  <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none">
                    {transmissions.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Fuel Type</label>
                  <select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none">
                    {fuels.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Seats</label>
                  <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Luggage</label>
                  <input type="number" value={form.luggage} onChange={(e) => setForm({ ...form, luggage: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Daily Rate (GH₵)</label>
                  <input type="number" value={form.daily} onChange={(e) => setForm({ ...form, daily: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Features</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.features.map((f, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm flex items-center gap-1">
                      {f}
                      <button onClick={() => removeFeature(f)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    placeholder="Add feature..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <button onClick={addFeature} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 block mb-2">Vehicle Image</label>
                <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
              </div>

              <button onClick={save} className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
