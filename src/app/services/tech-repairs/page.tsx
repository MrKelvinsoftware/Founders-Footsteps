"use client";

import { useMemo, useState, useEffect } from "react";
import { Smartphone, Laptop, Tablet, Tv, Camera, Headphones, Wrench, CheckCircle2, ArrowRight, Shield, Clock, Truck } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { useAuth } from "@/components/AuthProvider";
import { pay } from "@/lib/payments";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

type DeviceType = "phone" | "tablet" | "laptop" | "tv" | "camera" | "audio";

type RepairKind = {
  id: string;
  label: string;
  base: number;
};

const REPAIR_KINDS: RepairKind[] = [
  { id: "screen", label: "Screen replacement", base: 350 },
  { id: "battery", label: "Battery replacement", base: 150 },
  { id: "charging", label: "Charging port", base: 180 },
  { id: "speaker", label: "Speaker / mic", base: 120 },
  { id: "camera-module", label: "Camera module", base: 280 },
  { id: "water", label: "Water damage (diagnosis + clean)", base: 250 },
  { id: "software", label: "Software / OS reinstall", base: 120 },
  { id: "data", label: "Data recovery", base: 300 },
  { id: "keyboard", label: "Keyboard replacement", base: 220 },
  { id: "hinge", label: "Hinge / casing repair", base: 200 },
  { id: "panel", label: "Display panel (TV)", base: 800 },
  { id: "mainboard", label: "Mainboard (TV)", base: 600 },
  { id: "lens", label: "Lens service / cleaning", base: 180 },
  { id: "sensor", label: "Sensor cleaning", base: 150 },
  { id: "driver", label: "Driver replacement (audio)", base: 120 },
  { id: "bluetooth", label: "Bluetooth / pairing fix", base: 90 },
];

const BRAND_TIER: Record<string, number> = {
  "Tecno": 0.7, "Infinix": 0.7, "Itel": 0.65, "Xiaomi": 0.85, "Redmi": 0.8, "Samsung": 1.1, "Apple": 1.6, "Google": 1.2, "OnePlus": 1.0, "Huawei": 1.0, "OPPO": 0.9, "vivo": 0.9, "Nokia": 0.8,
  "HP": 1.0, "Dell": 1.05, "Lenovo": 1.0, "Acer": 0.95, "Asus": 1.0, "Apple MacBook": 1.6, "Microsoft Surface": 1.4, "Toshiba": 0.95,
  "iPad": 1.5, "Samsung Tab": 1.1, "Tecno Tab": 0.7, "Lenovo Tab": 0.9,
  "Samsung TV": 1.15, "LG TV": 1.15, "Sony TV": 1.3, "Hisense TV": 0.85, "TCL TV": 0.85, "Skyworth TV": 0.8,
  "Canon": 1.2, "Nikon": 1.2, "Sony Camera": 1.3, "Fujifilm": 1.2,
  "JBL": 1.0, "Sony Audio": 1.2, "Bose": 1.3, "Beats": 1.15, "AirPods": 1.4, "Samsung Buds": 1.0,
};

const MODEL_PREMIUM: Record<string, number> = {
  "iPhone 12": 1.0, "iPhone 12 Pro": 1.15, "iPhone 12 Pro Max": 1.2,
  "iPhone 13": 1.05, "iPhone 13 Pro": 1.2, "iPhone 13 Pro Max": 1.25,
  "iPhone 14": 1.1, "iPhone 14 Pro": 1.25, "iPhone 14 Pro Max": 1.3, "iPhone 14 Plus": 1.15,
  "iPhone 15": 1.15, "iPhone 15 Pro": 1.3, "iPhone 15 Pro Max": 1.35, "iPhone 15 Plus": 1.2,
  "iPhone 16": 1.2, "iPhone 16 Pro": 1.35, "iPhone 16 Pro Max": 1.4, "iPhone 16 Plus": 1.25,
  "iPhone 17": 1.25, "iPhone 17 Pro": 1.4, "iPhone 17 Pro Max": 1.45, "iPhone 17 Air": 1.3,
  "Galaxy S21": 1.0, "Galaxy S22": 1.05, "Galaxy S23": 1.1, "Galaxy S24": 1.15, "Galaxy S25": 1.2,
  "Galaxy S23 Ultra": 1.3, "Galaxy S24 Ultra": 1.35, "Galaxy S25 Ultra": 1.4,
  "Galaxy A54": 0.9, "Galaxy A55": 0.95, "Galaxy A34": 0.85, "Galaxy Z Flip5": 1.4, "Galaxy Z Fold5": 1.5,
  "MacBook Air M1": 1.0, "MacBook Air M2": 1.1, "MacBook Air M3": 1.15, "MacBook Air M4": 1.2,
  "MacBook Pro 14 M2": 1.2, "MacBook Pro 14 M3": 1.25, "MacBook Pro 14 M4": 1.3,
  "MacBook Pro 16 M3": 1.3, "MacBook Pro 16 M4": 1.35,
  "iPad 10th gen": 1.0, "iPad Air M2": 1.15, "iPad Pro M4 11\"": 1.3, "iPad Pro M4 13\"": 1.4, "iPad mini 7": 1.1,
  "HP Pavilion": 1.0, "HP Spectre": 1.2, "HP EliteBook": 1.15, "Dell XPS": 1.25, "Dell Inspiron": 1.0, "Dell Latitude": 1.1, "Lenovo ThinkPad": 1.15, "Lenovo IdeaPad": 1.0, "Asus ROG": 1.2, "Asus ZenBook": 1.15,
};

const REPAIRS_BY_TYPE: Record<DeviceType, string[]> = {
  phone: ["screen", "battery", "charging", "speaker", "camera-module", "water", "software", "data"],
  tablet: ["screen", "battery", "charging", "speaker", "camera-module", "water", "software", "data"],
  laptop: ["screen", "battery", "charging", "speaker", "keyboard", "hinge", "water", "software", "data"],
  tv: ["panel", "mainboard", "speaker", "software"],
  camera: ["lens", "sensor", "screen", "battery", "software", "data"],
  audio: ["driver", "bluetooth", "battery", "charging", "water"],
};

const DEVICE_TYPES: { id: DeviceType; name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "phone", name: "Phone", icon: Smartphone, color: "#2563eb" },
  { id: "tablet", name: "Tablet / iPad", icon: Tablet, color: "#7c3aed" },
  { id: "laptop", name: "Laptop / MacBook", icon: Laptop, color: "#059669" },
  { id: "tv", name: "TV / Display", icon: Tv, color: "#d97706" },
  { id: "camera", name: "Camera", icon: Camera, color: "#c026d3" },
  { id: "audio", name: "Headphones / Audio", icon: Headphones, color: "#0891b2" },
];

const BRANDS_BY_TYPE: Record<DeviceType, string[]> = {
  phone: ["Apple", "Samsung", "Tecno", "Infinix", "Itel", "Xiaomi", "Redmi", "Google", "OnePlus", "Huawei", "OPPO", "vivo", "Nokia"],
  tablet: ["iPad", "Samsung Tab", "Tecno Tab", "Lenovo Tab"],
  laptop: ["Apple MacBook", "HP", "Dell", "Lenovo", "Asus", "Acer", "Microsoft Surface", "Toshiba"],
  tv: ["Samsung TV", "LG TV", "Sony TV", "Hisense TV", "TCL TV", "Skyworth TV"],
  camera: ["Canon", "Nikon", "Sony Camera", "Fujifilm"],
  audio: ["AirPods", "JBL", "Sony Audio", "Bose", "Beats", "Samsung Buds"],
};

function estimatePrice(brand: string, model: string, kindId: string): number {
  const kind = REPAIR_KINDS.find((k) => k.id === kindId);
  if (!kind) return 0;
  const tier = BRAND_TIER[brand] ?? 1.0;
  const modelMult = MODEL_PREMIUM[model] ?? 1.0;
  return Math.round(kind.base * tier * modelMult);
}

export default function TechRepairsPage() {
  const { user } = useAuth();
  const [type, setType] = useState<DeviceType | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [repairs, setRepairs] = useState<string[]>([]);
  const [pickup, setPickup] = useState(false);
  const [address, setAddress] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const total = useMemo(() => repairs.reduce((s, k) => s + estimatePrice(brand, model, k), 0), [brand, model, repairs]);
  const toggleRepair = (id: string) => setRepairs((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const repairListFormatted = repairs.map((k) => {
      const label = REPAIR_KINDS.find((r) => r.id === k)?.label || k;
      const price = estimatePrice(brand, model, k);
      return `${label} (GH₵${price})`;
    }).join(", ");

    const finalTotal = total + (pickup ? 50 : 0);
    const customerEmail = user?.email || form.email;
    const customerName = user ? `${user.firstName} ${user.lastName}` : form.name;

    const res = await addSubmission({
      type: "tech-repair",
      total: finalTotal,
      currency: "GHS",
      customer: { 
        firstName: user ? user.firstName : (form.name.split(" ")[0] || "Guest"), 
        lastName: user ? user.lastName : form.name.split(" ").slice(1).join(" "), 
        email: customerEmail, 
        phone: user?.phone || form.phone 
      },
      summary: `Tech repair · ${type} · ${brand} ${model} · ${repairs.length} issue(s)`,
      payload: { 
        kind: "tech-repair", 
        type, 
        brand, 
        model, 
        repairs: repairListFormatted, 
        pickup, 
        address, 
        notes: form.notes 
      },
    });
    if (res) {
      setSubmitted(true);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f7f5fb] py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-violet-100">
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10 text-violet-600" /></div>
            <h2 className="font-display text-3xl text-slate-900 mb-3">Repair request received</h2>
            <p className="text-slate-600 mb-2">{brand} {model} · {repairs.length} issue(s)</p>
            <p className="font-display text-2xl text-violet-600 mb-4">GH₵{(total + (pickup ? 50 : 0)).toLocaleString()}</p>
            <p className="text-sm text-slate-500 mb-5">We&rsquo;ll call within 1 hour to confirm drop-off or arrange pickup.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => { setSubmitted(false); setRepairs([]); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Book another repair</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5fb]">
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-25">
          <img src="https://images.unsplash.com/photo-1588508065123-287b28e013da?w=1920&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-slate-950" />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-violet-300 font-semibold mb-3">Tech repairs</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] max-w-3xl">Tell us the device. We&rsquo;ll price it on the spot.</h1>
          <p className="text-white/70 mt-4 max-w-2xl">Real-time quotes in GH₵ based on brand, model and the exact repair. 90-day warranty. Free pickup in Accra &amp; Kumasi.</p>
        </div>
      </section>

      <ServiceInfoBanner slug="tech-repairs" />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <form onSubmit={submit} className="space-y-8">
          {/* Device type */}
          <section>
            <h2 className="font-display text-xl text-slate-900 mb-4">What needs fixing?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEVICE_TYPES.map((d) => (
                <button key={d.id} type="button" onClick={() => { setType(d.id); setBrand(""); setModel(""); setRepairs([]); }} className={`p-4 rounded-2xl border-2 text-left transition ${type === d.id ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}>
                  <span style={{ color: d.color }} className="block mb-2"><d.icon className="w-7 h-7" /></span>
                  <p className="font-semibold text-slate-900 text-sm">{d.name}</p>
                </button>
              ))}
            </div>
          </section>

          {type && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[rise_.3s_ease]">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5">Brand</label>
                <select value={brand} onChange={(e) => { setBrand(e.target.value); setModel(""); setRepairs([]); }} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500">
                  <option value="">Select brand…</option>
                  {BRANDS_BY_TYPE[type].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5">Model</label>
                <input value={model} onChange={(e) => { setModel(e.target.value); setRepairs([]); }} placeholder="e.g. iPhone 15 Pro Max" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
              </div>
            </section>
          )}

          {brand && model && (
            <section className="animate-[rise_.3s_ease]">
              <h2 className="font-display text-xl text-slate-900 mb-4">What&rsquo;s wrong?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {REPAIR_KINDS.filter((k) => REPAIRS_BY_TYPE[type!].includes(k.id)).map((k) => {
                  const price = estimatePrice(brand, model, k.id);
                  const sel = repairs.includes(k.id);
                  return (
                    <button key={k.id} type="button" onClick={() => toggleRepair(k.id)} className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${sel ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded border flex items-center justify-center ${sel ? "bg-violet-600 border-violet-600" : "border-slate-300"}`}>
                          {sel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className="font-medium text-slate-900 text-sm">{k.label}</span>
                      </div>
                      <span className="font-semibold text-violet-600 text-sm">GH₵{price}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {repairs.length > 0 && (
            <section className="space-y-4 animate-[rise_.3s_ease]">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Your details</h3>
                {user ? (
                  <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                    <p className="font-semibold text-slate-900">👤 {user.firstName} {user.lastName}</p>
                    <p className="text-slate-600 text-sm">{user.email}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                    <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                    <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="md:col-span-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                  </div>
                )}
                <textarea placeholder="Describe the issue (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-violet-500 resize-none mt-3" />
              </div>
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 border border-violet-100 cursor-pointer">
                <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="mt-0.5 w-4 h-4 accent-violet-600" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 flex items-center gap-2"><Truck className="w-4 h-4 text-violet-600" /> Free pickup &amp; delivery <span className="text-xs text-slate-500 font-normal">+ GH₵50 fee applies</span></p>
                  <p className="text-xs text-slate-600 mt-1">Within Accra &amp; Kumasi only</p>
                  {pickup && <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Pickup address" className="mt-2 w-full px-3 py-2 rounded-lg border border-violet-200 bg-white text-sm" />}
                </div>
              </label>
            </section>
          )}

          {repairs.length > 0 && (
            <button type="submit" className="w-full py-4 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 text-lg flex items-center justify-center gap-2">
              Submit repair request <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Trust + live total */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-violet-600 font-semibold">Live quote</p>
            <p className="font-display text-3xl text-slate-900 mt-1">GH₵{(total + (pickup ? 50 : 0)).toLocaleString()}</p>
            {repairs.length > 0 && (
              <div className="mt-4 space-y-1.5 text-sm max-h-48 overflow-y-auto">
                {repairs.map((k) => (
                  <div key={k} className="flex justify-between"><span className="text-slate-600">{REPAIR_KINDS.find((r) => r.id === k)?.label}</span><span className="font-medium">GH₵{estimatePrice(brand, model, k)}</span></div>
                ))}
                {pickup && <div className="flex justify-between"><span className="text-slate-600">Pickup fee</span><span className="font-medium">GH₵50</span></div>}
              </div>
            )}
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-violet-600" /> Same-day diagnosis</div>
            <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-violet-600" /> 90-day repair warranty</div>
            <div className="flex items-center gap-2 text-sm"><Wrench className="w-4 h-4 text-violet-600" /> Genuine OEM parts</div>
            <div className="flex items-center gap-2 text-sm"><Truck className="w-4 h-4 text-violet-600" /> Free pickup in Accra / Kumasi</div>
          </div>
        </aside>
      </div>
      <style jsx global>{`@keyframes rise { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
}
