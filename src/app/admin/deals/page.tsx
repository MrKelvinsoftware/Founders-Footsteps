"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit3, Trash2, Eye, EyeOff, X, Save, Check, Tag } from "lucide-react";
import { addCustom, updateCustom, removeCustom, getCustom, hide, unhide, getHidden, mergeWithSeed, uid, slugify } from "@/lib/contentStore";
import ImageUpload from "@/components/ImageUpload";

export type Deal = {
  id: string; title: string; slug: string; description: string; image: string;
  originalPrice: string; dealPrice: string; discount: number; isHotDeal: boolean; badge: string;
  startDate: string; endDate: string; isActive: boolean; _custom?: boolean;
};

const seedDeals: Deal[] = [
  { id: "d1", title: "Greece Tour", slug: "greece-tour", description: "5 Days / 4 Nights in Santorini & Athens", originalPrice: "6300", dealPrice: "4410", discount: 30, image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1000&q=80", isHotDeal: true, badge: "Best Seller", startDate: "", endDate: "", isActive: true },
  { id: "d2", title: "Thailand Escape", slug: "thailand-escape", description: "6 Days / 5 Nights in Bangkok & Phuket", originalPrice: "5300", dealPrice: "3763", discount: 29, image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1000&q=80", isHotDeal: true, badge: "Hot Deal", startDate: "", endDate: "", isActive: true },
  { id: "d3", title: "Japan Discovery", slug: "japan-discovery", description: "7 Days / 6 Nights in Tokyo & Kyoto", originalPrice: "9200", dealPrice: "6348", discount: 31, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80", isHotDeal: true, badge: "New Offer", startDate: "", endDate: "", isActive: true },
  { id: "d4", title: "Luxury Safari", slug: "luxury-safari", description: "8 Days / 7 Nights in Kenya & Tanzania", originalPrice: "17500", dealPrice: "13300", discount: 24, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1000&q=80", isHotDeal: false, badge: "", startDate: "", endDate: "", isActive: true },
];

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-rose-500";

type FormState = Omit<Deal, "id" | "_custom"> & { id: string };
const empty = (): FormState => ({ id: "", title: "", slug: "", description: "", image: "", originalPrice: "", dealPrice: "", discount: 0, isHotDeal: false, badge: "", startDate: "", endDate: "", isActive: true });

export default function AdminDealsPage() {
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty());
  const [toast, setToast] = useState("");

  const custom = useMemo(() => getCustom<Deal>("deals"), [tick]);
  const hidden = useMemo(() => getHidden("deals"), [tick]);
  const all = useMemo(() => mergeWithSeed(seedDeals, "deals") as Deal[], [tick]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const onPrice = (k: "originalPrice" | "dealPrice", v: string) => {
    const next = { ...form, [k]: v };
    const o = parseFloat(next.originalPrice), d = parseFloat(next.dealPrice);
    next.discount = o > 0 && d > 0 && o > d ? Math.round((1 - d / o) * 100) : 0;
    setForm(next);
  };

  const save = () => {
    if (!form.title.trim() || !form.image || !form.dealPrice) { flash("Title, image and deal price are required."); return; }
    const payload: Deal = { ...form, id: form.id || uid("deal"), slug: form.slug || slugify(form.title), _custom: true };
    try {
      if (form.id && custom.some((c) => c.id === form.id)) updateCustom("deals", payload); else addCustom("deals", payload);
      setOpen(false); setTick((t) => t + 1); flash("Deal published.");
    } catch (e: any) { flash(e?.message || "Could not save."); }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
            <div><p className="text-[10px] uppercase tracking-[0.28em] text-rose-600 font-semibold">Promotions</p><h1 className="font-display text-2xl text-slate-900 leading-none">Deals</h1></div>
          </div>
          <button onClick={() => { setForm(empty()); setOpen(true); }} className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-rose-500 flex items-center gap-2"><Plus className="w-4 h-4" /> New deal</button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {all.map((d) => {
          const isCustom = custom.some((c) => c.id === d.id);
          const isHidden = hidden.includes(d.id);
          return (
            <div key={d.id} className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition ${isHidden ? "opacity-50" : ""}`}>
              <div className="relative aspect-[4/3] bg-slate-100">
                <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                {d.discount > 0 && <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold">-{d.discount}%</span>}
                {d.badge && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider">{d.badge}</span>}
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setForm({ ...d }); setOpen(true); }} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-rose-500 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { (isHidden ? unhide : hide)("deals", d.id); setTick((t) => t + 1); }} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-900 hover:text-white">{isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  {isCustom && <button onClick={() => { if (confirm(`Delete "${d.title}"?`)) { removeCustom("deals", d.id); setTick((t) => t + 1); flash("Deleted."); } }} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{isCustom ? "Custom" : "Seed"} {isHidden && "· hidden"}</p>
                <h3 className="font-display text-lg text-slate-900 mt-0.5">{d.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{d.description}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display text-lg text-rose-600">GH₵{parseFloat(d.dealPrice).toLocaleString()}</span>
                  <span className="text-slate-400 line-through text-sm">GH₵{parseFloat(d.originalPrice).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl animate-[slideInRight_.3s_ease]">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div><p className="text-[10px] uppercase tracking-[0.28em] text-rose-600 font-semibold">{form.id && custom.some((c) => c.id === form.id) ? "Edit" : "New"} deal</p><h2 className="font-display text-xl text-slate-900 leading-none mt-1">{form.title || "Untitled"}</h2></div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUpload value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Banner image" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="lbl">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} className={inp} placeholder="Greece Tour" /></div>
                <div className="col-span-2"><label className="lbl">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} placeholder="5 Days / 4 Nights" /></div>
                <div><label className="lbl">Original price</label><input value={form.originalPrice} onChange={(e) => onPrice("originalPrice", e.target.value)} className={inp} placeholder="6300" /></div>
                <div><label className="lbl">Deal price</label><input value={form.dealPrice} onChange={(e) => onPrice("dealPrice", e.target.value)} className={inp} placeholder="4410" /></div>
                <div><label className="lbl">Badge</label><input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inp} placeholder="Hot Deal" /></div>
                <div><label className="lbl">Discount</label><input value={form.discount} disabled className={inp + " bg-slate-50"} /></div>
                <div><label className="lbl">Start date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inp} /></div>
                <div><label className="lbl">End date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inp} /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isHotDeal} onChange={(e) => setForm({ ...form, isHotDeal: e.target.checked })} className="accent-rose-500 w-4 h-4" /> Hot deal</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-rose-500 w-4 h-4" /> Active</label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold">Cancel</button>
              <button onClick={save} className="flex-1 px-4 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-rose-500 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[rise_.3s_ease]"><Check className="w-4 h-4 text-emerald-400" /> {toast}</div>}
      <style jsx global>{`
        .lbl { display:block; font-size:10px; text-transform:uppercase; letter-spacing:.18em; color:#475569; font-weight:600; margin-bottom:6px; }
        .inp { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #e2e8f0; font-size:14px; outline:none; }
        .inp:focus { border-color:#f43f5e; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
