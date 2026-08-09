"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, Package, Edit3, Trash2, Eye, EyeOff, X,
  Save, Image as ImageIcon, Tag, Check,
} from "lucide-react";
import { categories, products as seedProducts, type Product } from "@/lib/products";
import {
  addCustom, updateCustom, removeCustom, getCustom, hide, unhide, getHidden, mergeWithSeed, uid, slugify,
} from "@/lib/contentStore";
import ImageUpload from "@/components/ImageUpload";

type FormState = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: string;
  comparePrice: string;
  description: string;
  image: string;
  rating: string;
  reviews: string;
  sold: string;
  inStock: string;
  specs: { label: string; value: string }[];
};

const emptyForm = (): FormState => ({
  id: "",
  name: "",
  slug: "",
  category: "electronics",
  brand: "",
  price: "",
  comparePrice: "",
  description: "",
  image: "",
  rating: "4.7",
  reviews: "0",
  sold: "0",
  inStock: "10",
  specs: [],
});

export default function AdminProductsPage() {
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [toast, setToast] = useState<string>("");

  const custom = useMemo(() => getCustom<Product>("products"), [tick]);
  const hidden = useMemo(() => getHidden("products"), [tick]);
  const all = useMemo(() => mergeWithSeed(seedProducts, "products"), [tick]);

  const filtered = all.filter((p) => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (query && !(`${p.name} ${p.brand ?? ""}`.toLowerCase().includes(query.toLowerCase()))) return false;
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
  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      brand: p.brand || "",
      price: p.price,
      comparePrice: p.comparePrice || "",
      description: p.description,
      image: p.images[0] || "",
      rating: String(p.rating),
      reviews: String(p.reviews),
      sold: String(p.sold),
      inStock: String(p.inStock ?? 0),
      specs: p.specs ? p.specs.map((s) => ({ ...s })) : [],
    });
    setDrawerOpen(true);
  };

  const onNameChange = (v: string) => {
    setForm((f) => ({
      ...f,
      name: v,
      slug: f.id && !custom.some((c) => c.id === f.id) ? f.slug : slugify(v),
    }));
  };

  const save = () => {
    if (!form.name.trim() || !form.price.trim() || !form.image) {
      flash("Name, price and image are required.");
      return;
    }
    const payload: Product = {
      id: form.id || uid("prd"),
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      category: form.category,
      brand: form.brand || undefined,
      price: form.price,
      comparePrice: form.comparePrice || undefined,
      description: form.description,
      images: [form.image],
      rating: parseFloat(form.rating) || 4.5,
      reviews: parseInt(form.reviews) || 0,
      sold: parseInt(form.sold) || 0,
      inStock: parseInt(form.inStock) || 0,
      specs: form.specs.filter((s) => s.label && s.value),
    };
    try {
      if (form.id && custom.some((c) => c.id === form.id)) updateCustom("products", payload);
      else addCustom("products", payload);
      setDrawerOpen(false);
      setTick((t) => t + 1);
      flash("Saved to the live catalogue.");
    } catch (e: any) {
      flash(e?.message || "Could not save.");
    }
  };

  const onDelete = (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    removeCustom("products", p.id);
    setTick((t) => t + 1);
    flash("Deleted.");
  };
  const onHide = (p: Product) => {
    if (hidden.includes(p.id)) unhide("products", p.id);
    else hide("products", p.id);
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-orange-600 font-semibold">Catalogue</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Products</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">{all.length} live · {custom.length} custom</span>
            <button onClick={openNew} className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New product
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-t border-slate-100">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search catalogue…" className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-200" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <button onClick={() => setCatFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>All</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${catFilter === c.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{c.icon} {c.name}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => {
            const isCustom = custom.some((c) => c.id === p.id);
            const isHidden = hidden.includes(p.id);
            return (
              <div key={p.id} className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all ${isHidden ? "opacity-50" : ""}`}>
                <div className="relative aspect-square bg-slate-100">
                  <img src={p.images?.[0] ?? ""} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isCustom && <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">Custom</span>}
                    {isHidden && <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">Hidden</span>}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} title="Edit" className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-orange-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onHide(p)} title={isHidden ? "Show" : "Hide"} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-900 hover:text-white">{isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    {isCustom && <button onClick={() => onDelete(p)} title="Delete" className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">{categories.find((c) => c.id === p.category)?.name}</p>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1 mt-0.5">{p.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-display text-base text-orange-600">GH₵{parseFloat(p.price).toLocaleString()}</span>
                    <span className="text-[11px] text-slate-500">Stock {p.inStock ?? 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-[slideInRight_.3s_ease]">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-orange-600 font-semibold">{form.id && custom.some((c) => c.id === form.id) ? "Edit" : "New"} product</p>
                <h2 className="font-display text-xl text-slate-900 leading-none mt-1">{form.name || "Untitled"}</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
            </div>

            <div className="p-6 space-y-5">
              <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Product image" hint="Square works best. Auto-resized." />

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Name</label>
                  <input value={form.name} onChange={(e) => onNameChange(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="e.g. Air Fryer 5.5L Digital" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="e.g. Samsung" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Price (GH₵)</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="899" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Compare price</label>
                  <input value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="1199" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Stock</label>
                  <input value={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="25" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Rating (0-5)</label>
                  <input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" placeholder="4.7" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500 resize-none" placeholder="Describe the item — features, warranty, what's in the box…" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 flex items-center gap-1"><Tag className="w-3 h-3" /> Specifications</label>
                  <button type="button" onClick={() => setForm({ ...form, specs: [...form.specs, { label: "", value: "" }] })} className="text-xs text-orange-600 font-semibold hover:text-orange-700">+ Add row</button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={s.label} onChange={(e) => { const n = [...form.specs]; n[i] = { ...n[i], label: e.target.value }; setForm({ ...form, specs: n }); }} placeholder="Label (e.g. Capacity)" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
                      <input value={s.value} onChange={(e) => { const n = [...form.specs]; n[i] = { ...n[i], value: e.target.value }; setForm({ ...form, specs: n }); }} placeholder="Value (e.g. 5.5L)" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
                      <button type="button" onClick={() => setForm({ ...form, specs: form.specs.filter((_, j) => j !== i) })} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {form.specs.length === 0 && <p className="text-xs text-slate-400">No specs yet. Add key/value rows to show on the product page.</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Live preview</label>
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white max-w-[220px]">
                  <div className="aspect-square bg-slate-100">{form.image && <img src={form.image} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{categories.find((c) => c.id === form.category)?.name}</p>
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 h-10 mt-0.5">{form.name || "Product name"}</p>
                    <p className="text-orange-600 font-bold mt-1">GH₵{parseFloat(form.price || "0").toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
              <button onClick={() => setDrawerOpen(false)} className="flex-1 px-4 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">Cancel</button>
              <button onClick={save} className="flex-1 px-4 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-orange-500 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save & publish</button>
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
