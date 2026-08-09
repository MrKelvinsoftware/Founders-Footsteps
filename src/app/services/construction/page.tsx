"use client";

import { useState, useMemo } from "react";
import { Home, MapPin, Calendar, DollarSign, CheckCircle, ArrowRight, Bed, Bath, Car, Ruler, FileText, Layers, Shield, Wrench } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

type QualityTier = "standard" | "mid" | "premium";

interface TierPricing {
  label: string;
  perSqm: number;
  description: string;
  substructure: number;
  finishing: number;
  furnishing: number;
  utilities: number;
}

const TIERS: Record<QualityTier, TierPricing> = {
  standard: {
    label: "Standard / Economy",
    perSqm: 4200,
    description: "Local materials, standard plastering, basic tiling, local furniture, basic appliances.",
    substructure: 0.44, finishing: 0.30, furnishing: 0.18, utilities: 0.08,
  },
  mid: {
    label: "Mid-Market / Modern",
    perSqm: 7000,
    description: "POP ceilings, porcelain tiles, fitted kitchen, premium security doors, full furnishing.",
    substructure: 0.44, finishing: 0.30, furnishing: 0.18, utilities: 0.08,
  },
  premium: {
    label: "Premium / Luxury",
    perSqm: 14000,
    description: "High-end imported finishes, smart home tech, luxury furniture, compound wall, solar backup.",
    substructure: 0.40, finishing: 0.30, furnishing: 0.22, utilities: 0.08,
  },
};

function estimateFloorArea(rooms: number, baths: number): number {
  const commonArea = 45;
  const perBedroom = 22;
  const extraBathrooms = Math.max(0, baths - rooms);
  return commonArea + rooms * perBedroom + extraBathrooms * 6;
}

const GENERAL_FEATURE_PRICES: Record<string, number> = {
  "Swimming Pool": 180000,
  "Generator House": 25000,
  "Gate House": 45000,
  "Driver's Room": 35000,
  "Guest Room": 40000,
  "Balcony": 12000,
  "Walk-in Closet": 8000,
  "Home Office": 18000,
  "Store Room": 10000,
  "Garden/Landscape": 15000,
};
const TIER_FEATURE_MULTIPLIER: Record<QualityTier, number> = { standard: 0.8, mid: 1.0, premium: 1.4 };

const ROOFING_OPTIONS = [
  { id: "long-span-aluminum", name: "Long Span Aluminum", pricePerSqm: 180 },
  { id: "step-tiles", name: "Step Tiles", pricePerSqm: 220 },
  { id: "stone-coated", name: "Stone-Coated Metal", pricePerSqm: 350 },
  { id: "clay-tiles", name: "Clay Tiles", pricePerSqm: 280 },
  { id: "aluzinc", name: "Premium Aluzinc", pricePerSqm: 250 },
];

const ROOF_FRAMES = [
  { id: "wood", name: "Wood Truss", pricePerSqm: 85 },
  { id: "steel", name: "Steel Truss", pricePerSqm: 145 },
];

const ROOF_TYPES = [
  { id: "hip", name: "Hip Roof", areaMultiplier: 1.35 },
  { id: "gable", name: "Gable Roof", areaMultiplier: 1.15 },
  { id: "flat", name: "Flat Roof", areaMultiplier: 1.0 },
  { id: "secret", name: "Secret / Parapet", areaMultiplier: 1.25 },
];

const ROOFING_EXTRAS = [
  { name: "Thermal Insulation", price: 12000 },
  { name: "Active Roof Ventilation", price: 8500 },
  { name: "Rainwater Harvesting Tank", price: 15000 },
  { name: "Double-Glazed Skylights", price: 22000 },
  { name: "Noise-Dampening Underlay", price: 18000 },
  { name: "Solar Panel Mounting System", price: 35000 },
  { name: "Anti-Algae Treatment", price: 9000 },
  { name: "Heavy Rain / Snow Guards", price: 7500 },
];

const ROOFING_SERVICE_TYPES = [
  { id: "new-roof", name: "New Roof Installation", description: "Complete new roofing from scratch" },
  { id: "repair", name: "Roof Repair", description: "Fix leaks, damaged sheets, replace sections" },
  { id: "replacement", name: "Full Roof Replacement", description: "Remove old roof and install new" },
  { id: "maintenance", name: "Roof Maintenance", description: "Inspection, cleaning, waterproofing" },
];

const ROOF_REPAIR_ISSUES = [
  "Leaking roof",
  "Missing or damaged sheets",
  "Damaged gutters/fascia",
  "Sagging roof structure",
  "Rust/corrosion",
  "Poor drainage",
  "Storm damage",
  "Termite/insect damage",
  "Broken ridge cap",
  "Ceiling damage from leak",
];

const GENERAL_FEATURES = [
  "Swimming Pool", "Generator House", "Gate House", "Driver's Room", "Guest Room",
  "Balcony", "Walk-in Closet", "Home Office", "Store Room", "Garden/Landscape"
];

const RENOVATION_AREAS = [
  "Kitchen", "Bathroom", "Bedroom", "Living Room", "Dining Room",
  "Exterior", "Flooring", "Painting", "Electrical", "Plumbing"
];

export default function ConstructionPage() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    projectType: "",
    tier: "mid" as QualityTier,
    landLocation: "",
    landSize: "",
    numberOfRooms: "2",
    numberOfBathrooms: "2",
    numberOfFloors: "1",
    parkingSpace: "",
    features: [] as string[],
    renovationAreas: [] as string[],
    renovationDescription: "",
    roofType: "",
    roofFrame: "",
    roofSheet: "",
    roofExtras: [] as string[],
    roofAreaSqm: "",
    roofServiceType: "",
    roofRepairIssues: [] as string[],
    roofRepairDescription: "",
    extensionType: "",
    extensionSize: "",
    budgetRange: "",
    timeline: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    preferredContact: "phone",
  });

  const set = (key: string, val: unknown) => setF((p) => ({ ...p, [key]: val }));
  const toggle = (key: string, val: string) => setF((p) => {
    const arr = (p as Record<string, unknown>)[key] as string[];
    return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
  });

  const [submitted, setSubmitted] = useState(false);

  const estimate = useMemo(() => {
    const rooms = parseInt(f.numberOfRooms) || 0;
    const baths = parseInt(f.numberOfBathrooms) || 0;
    const floors = parseInt(f.numberOfFloors) || 1;
    const parking = parseInt(f.parkingSpace) || 0;
    const tier = TIERS[f.tier];

    if (f.projectType === "new-construction" && rooms > 0) {
      const sqm = estimateFloorArea(rooms, baths);
      let base = sqm * tier.perSqm;
      if (floors > 1) base *= 1 + (floors - 1) * 0.12;
      const parkingCost = parking * 6000 * TIER_FEATURE_MULTIPLIER[f.tier];
      const featuresCost = f.features.reduce((s, name) => s + (GENERAL_FEATURE_PRICES[name] ?? 0) * TIER_FEATURE_MULTIPLIER[f.tier], 0);
      const buildTotal = base + parkingCost;
      return {
        total: Math.round(buildTotal + featuresCost),
        substructure: Math.round(buildTotal * tier.substructure),
        finishing: Math.round(buildTotal * tier.finishing),
        furnishing: Math.round(buildTotal * tier.furnishing),
        utilities: Math.round(buildTotal * tier.utilities),
        features: Math.round(featuresCost),
        floorArea: Math.round(sqm),
      };
    }

    if (f.projectType === "roofing") {
      const area = parseInt(f.roofAreaSqm) || 100;
      const roofType = ROOF_TYPES.find((r) => r.id === f.roofType);
      const frame = ROOF_FRAMES.find((r) => r.id === f.roofFrame);
      const sheet = ROOFING_OPTIONS.find((r) => r.id === f.roofSheet);
      const multiplier = roofType?.areaMultiplier ?? 1.2;
      const effectiveArea = area * multiplier;
      const frameCost = frame ? effectiveArea * frame.pricePerSqm : 0;
      const sheetCost = sheet ? effectiveArea * sheet.pricePerSqm : 0;
      const extrasCost = f.roofExtras.reduce((s, n) => s + (ROOFING_EXTRAS.find((x) => x.name === n)?.price ?? 0), 0);
      const labor = Math.round((frameCost + sheetCost) * 0.35);
      return {
        total: Math.round(frameCost + sheetCost + extrasCost + labor),
        substructure: Math.round(frameCost),
        finishing: Math.round(sheetCost),
        furnishing: extrasCost,
        utilities: labor,
        features: 0,
        floorArea: area,
      };
    }

    if (f.projectType === "renovation") {
      const areaCount = f.renovationAreas.length;
      const base = areaCount * 25000 + Math.max(0, baths - 1) * 20000;
      return { total: Math.round(base), substructure: Math.round(base * 0.3), finishing: Math.round(base * 0.5), furnishing: Math.round(base * 0.1), utilities: Math.round(base * 0.1), features: 0, floorArea: 0 };
    }

    if (f.projectType === "extension") {
      const sqm = parseInt(f.extensionSize) || 30;
      const base = sqm * tier.perSqm * 1.15;
      return { total: Math.round(base), substructure: Math.round(base * 0.45), finishing: Math.round(base * 0.35), furnishing: Math.round(base * 0.1), utilities: Math.round(base * 0.1), features: 0, floorArea: sqm };
    }

    if (f.projectType === "painting") {
      const areaCount = f.renovationAreas.length || 1;
      const base = areaCount * 8000;
      return { total: Math.round(base), substructure: 0, finishing: Math.round(base * 0.7), furnishing: Math.round(base * 0.3), utilities: 0, features: 0, floorArea: 0 };
    }

    if (f.projectType === "plumbing") {
      const areaCount = f.renovationAreas.length || 1;
      const base = areaCount * 12000;
      return { total: Math.round(base), substructure: Math.round(base * 0.4), finishing: Math.round(base * 0.3), furnishing: Math.round(base * 0.2), utilities: Math.round(base * 0.1), features: 0, floorArea: 0 };
    }

    if (f.projectType === "fence-wall") {
      const sqm = parseInt(f.extensionSize) || 50;
      const base = sqm * 1200;
      return { total: Math.round(base), substructure: Math.round(base * 0.5), finishing: Math.round(base * 0.3), furnishing: Math.round(base * 0.1), utilities: Math.round(base * 0.1), features: 0, floorArea: sqm };
    }

    if (f.projectType === "tiling") {
      const sqm = parseInt(f.extensionSize) || 40;
      const base = sqm * 350;
      return { total: Math.round(base), substructure: 0, finishing: Math.round(base * 0.6), furnishing: Math.round(base * 0.4), utilities: 0, features: 0, floorArea: sqm };
    }

    return { total: 0, substructure: 0, finishing: 0, furnishing: 0, utilities: 0, features: 0, floorArea: 0 };
  }, [f]);

  const featureOptions = f.projectType === "roofing" ? ROOFING_EXTRAS.map((x) => x.name) : GENERAL_FEATURES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubmission({
      type: "construction",
      total: estimate.total,
      currency: "GHS",
      customer: { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone },
      summary: `${f.projectType} · ${f.numberOfRooms} bed · ${f.tier} tier · ${f.landLocation || "site TBC"}`,
      payload: { ...f, estimate },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-100">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="font-display text-3xl text-slate-900 mb-3">Request received</h2>
            <p className="text-slate-600 mb-2">Your preliminary estimate: <span className="font-display text-2xl text-blue-600">GH₵{estimate.total.toLocaleString()}</span></p>
            <p className="text-slate-500 text-sm mb-5">Our team will schedule a free site inspection and provide a detailed quotation within 48 hours.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={f.email} phone={f.phone} />
            </div>
            <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Submit another request</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-slate-950" />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-blue-300 font-semibold mb-3">Construction & Real Estate</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] max-w-3xl">Build your dream home. Know the cost before you start.</h1>
          <p className="text-white/70 mt-4 max-w-2xl">Real-time estimates based on 2026 Ghana construction market rates. All prices in Ghana Cedis.</p>
        </div>
      </section>

      <ServiceInfoBanner slug="construction" />

      {/* Estimate sidebar + form */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Step 1: Project Type */}
          <section>
            <h2 className="font-display text-2xl text-slate-900 mb-5">What would you like to build?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "new-construction", name: "New Home Construction", icon: Home, from: 320000 },
                { id: "renovation", name: "Home Renovation", icon: Wrench, from: 5000 },
                { id: "extension", name: "Home Extension", icon: Layers, from: 50000 },
                { id: "roofing", name: "Roofing & Repairs", icon: Shield, from: 5000 },
                { id: "painting", name: "Painting & Finishing", icon: Layers, from: 5000 },
                { id: "plumbing", name: "Plumbing & Electrical", icon: Wrench, from: 5000 },
                { id: "fence-wall", name: "Fence Wall / Compound", icon: Shield, from: 15000 },
                { id: "tiling", name: "Tiling & Flooring", icon: Layers, from: 8000 },
              ].map((o) => (
                <button key={o.id} type="button" onClick={() => set("projectType", o.id)} className={`p-5 rounded-2xl border-2 text-left transition-all ${f.projectType === o.id ? "border-blue-500 bg-blue-50 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><o.icon className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <p className="font-bold text-slate-900">{o.name}</p>
                      <p className="text-sm text-slate-500">From GH₵{o.from.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Tier selector for new builds */}
          {(f.projectType === "new-construction" || f.projectType === "extension") && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">Quality tier</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(TIERS).map(([key, t]) => (
                  <button key={key} type="button" onClick={() => set("tier", key)} className={`p-4 rounded-xl border-2 text-left transition ${f.tier === key ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <p className="font-bold text-slate-900 text-sm">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* New Construction Details */}
          {f.projectType === "new-construction" && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">House specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Land location</label>
                  <input value={f.landLocation} onChange={(e) => set("landLocation", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. East Legon, Accra" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Ruler className="w-3.5 h-3.5 inline mr-1" /> Land size (plots)</label>
                  <input type="number" value={f.landSize} onChange={(e) => set("landSize", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 2" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Bed className="w-3.5 h-3.5 inline mr-1" /> Bedrooms</label>
                  <input type="number" min={1} max={12} value={f.numberOfRooms} onChange={(e) => set("numberOfRooms", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Bath className="w-3.5 h-3.5 inline mr-1" /> Bathrooms</label>
                  <input type="number" min={1} max={12} value={f.numberOfBathrooms} onChange={(e) => set("numberOfBathrooms", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5">Floors</label>
                  <select value={f.numberOfFloors} onChange={(e) => set("numberOfFloors", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500">
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Storey" : "Storeys"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Car className="w-3.5 h-3.5 inline mr-1" /> Parking</label>
                  <select value={f.parkingSpace} onChange={(e) => set("parkingSpace", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select</option>
                    <option value="1">1 Car</option>
                    <option value="2">2 Cars</option>
                    <option value="3">3+ Cars</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Roofing Details */}
          {f.projectType === "roofing" && (
            <section className="space-y-5">
              <h2 className="font-display text-xl text-slate-900 mb-4">Roofing specifications</h2>
              
              {/* Roofing Service Type */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">What do you need?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ROOFING_SERVICE_TYPES.map((r) => (
                    <button key={r.id} type="button" onClick={() => set("roofServiceType", r.id)} className={`p-3 rounded-xl border-2 text-left text-sm transition ${f.roofServiceType === r.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{r.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Repair-specific issues */}
              {(f.roofServiceType === "repair" || f.roofServiceType === "maintenance") && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">What issues are you facing?</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ROOF_REPAIR_ISSUES.map((issue) => (
                      <button key={issue} type="button" onClick={() => toggle("roofRepairIssues", issue)} className={`px-3 py-2 rounded-xl border text-sm transition ${f.roofRepairIssues.includes(issue) ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                        {issue}
                      </button>
                    ))}
                  </div>
                  <textarea value={f.roofRepairDescription} onChange={(e) => set("roofRepairDescription", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Describe the roofing issue in detail... (e.g. leaking in the master bedroom, water comes through when it rains heavily)" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Location</label>
                  <input value={f.landLocation} onChange={(e) => set("landLocation", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="Site address" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Ruler className="w-3.5 h-3.5 inline mr-1" /> Roof area (sqm)</label>
                  <input type="number" value={f.roofAreaSqm} onChange={(e) => set("roofAreaSqm", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 120" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">Roof type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ROOF_TYPES.map((r) => (
                    <button key={r.id} type="button" onClick={() => set("roofType", r.id)} className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${f.roofType === r.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">Frame material</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROOF_FRAMES.map((r) => (
                    <button key={r.id} type="button" onClick={() => set("roofFrame", r.id)} className={`p-3 rounded-xl border-2 text-left text-sm transition ${f.roofFrame === r.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">GH₵{r.pricePerSqm}/sqm</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">Roofing sheet</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ROOFING_OPTIONS.map((r) => (
                    <button key={r.id} type="button" onClick={() => set("roofSheet", r.id)} className={`p-3 rounded-xl border-2 text-left text-sm transition ${f.roofSheet === r.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      <p className="text-xs text-slate-500">GH₵{r.pricePerSqm}/sqm</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-2">Roofing extras</label>
                <div className="flex flex-wrap gap-2">
                  {ROOFING_EXTRAS.map((x) => (
                    <button key={x.name} type="button" onClick={() => toggle("roofExtras", x.name)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${f.roofExtras.includes(x.name) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${f.roofExtras.includes(x.name) ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                        {f.roofExtras.includes(x.name) && <CheckCircle className="w-3 h-3 text-white" />}
                      </span>
                      {x.name} <span className="text-xs text-slate-400">+GH₵{x.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Renovation */}
          {f.projectType === "renovation" && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">Areas to renovate</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {RENOVATION_AREAS.map((a) => (
                  <button key={a} type="button" onClick={() => toggle("renovationAreas", a)} className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${f.renovationAreas.includes(a) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>{a}</button>
                ))}
              </div>
              <textarea value={f.renovationDescription} onChange={(e) => set("renovationDescription", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Describe what you want done..." />
            </section>
          )}

          {/* Extension */}
          {f.projectType === "extension" && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">Extension details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {[{ id: "bedroom", name: "Extra Bedroom(s)" }, { id: "kitchen", name: "Kitchen Extension" }, { id: "garage", name: "Garage / Carport" }, { id: "storey", name: "Add a Storey" }].map((e) => (
                  <button key={e.id} type="button" onClick={() => set("extensionType", e.id)} className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${f.extensionType === e.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>{e.name}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5">Approximate size (sqm)</label>
                  <input type="number" value={f.extensionSize} onChange={(e) => set("extensionSize", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 40" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5">Location</label>
                  <input value={f.landLocation} onChange={(e) => set("landLocation", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="Property address" />
                </div>
              </div>
            </section>
          )}

          {/* Additional features (only for new builds / renovation) */}
          {(f.projectType === "new-construction" || f.projectType === "renovation") && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">Additional features</h2>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map((feat) => (
                  <button key={feat} type="button" onClick={() => toggle("features", feat)} className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${f.features.includes(feat) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>{feat}</button>
                ))}
              </div>
            </section>
          )}

          {/* Budget & Timeline */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><DollarSign className="w-3.5 h-3.5 inline mr-1" /> Budget range</label>
              <select value={f.budgetRange} onChange={(e) => set("budgetRange", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select</option>
                <option value="5k-20k">GH₵5,000 – GH₵20,000</option>
                <option value="20k-50k">GH₵20,000 – GH₵50,000</option>
                <option value="50k-100k">GH₵50,000 – GH₵100,000</option>
                <option value="100k-200k">GH₵100,000 – GH₵200,000</option>
                <option value="200k-500k">GH₵200,000 – GH₵500,000</option>
                <option value="500k-1m">GH₵500,000 – GH₵1,000,000</option>
                <option value="1m-2m">GH₵1,000,000 – GH₵2,000,000</option>
                <option value="2m+">GH₵2,000,000+</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Calendar className="w-3.5 h-3.5 inline mr-1" /> Timeline</label>
              <select value={f.timeline} onChange={(e) => set("timeline", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select</option>
                <option value="asap">As soon as possible</option>
                <option value="1-month">Within 1 month</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </section>

          {/* Painting/Plumbing/Tiling/Fence sections */}
          {(f.projectType === "painting" || f.projectType === "plumbing" || f.projectType === "tiling") && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">
                {f.projectType === "painting" ? "Areas to paint" : f.projectType === "plumbing" ? "Plumbing & Electrical work" : "Tiling areas"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {RENOVATION_AREAS.map((a) => (
                  <button key={a} type="button" onClick={() => toggle("renovationAreas", a)} className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition ${f.renovationAreas.includes(a) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}>{a}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Location</label>
                  <input value={f.landLocation} onChange={(e) => set("landLocation", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="Property address" />
                </div>
                {f.projectType === "tiling" && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Ruler className="w-3.5 h-3.5 inline mr-1" /> Area (sqm)</label>
                    <input type="number" value={f.extensionSize} onChange={(e) => set("extensionSize", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 40" />
                  </div>
                )}
              </div>
              <textarea value={f.renovationDescription} onChange={(e) => set("renovationDescription", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none mt-4" placeholder="Describe what you need done..." />
            </section>
          )}

          {f.projectType === "fence-wall" && (
            <section>
              <h2 className="font-display text-xl text-slate-900 mb-4">Fence / Compound Wall</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Location</label>
                  <input value={f.landLocation} onChange={(e) => set("landLocation", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="Property address" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-widest block mb-1.5"><Ruler className="w-3.5 h-3.5 inline mr-1" /> Wall length (meters)</label>
                  <input type="number" value={f.extensionSize} onChange={(e) => set("extensionSize", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 50" />
                </div>
              </div>
              <textarea value={f.renovationDescription} onChange={(e) => set("renovationDescription", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none mt-4" placeholder="Include gate, pillars, or any specific requirements..." />
            </section>
          )}

          {/* Contact */}
          <section>
            <h2 className="font-display text-xl text-slate-900 mb-4">Your details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="First name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
              <input required placeholder="Last name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
              <input required type="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
              <input required type="tel" placeholder="Phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500" />
              <input type="tel" placeholder="WhatsApp (for estimate & invoice)" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 md:col-span-2" />
            </div>
          </section>

          <button type="submit" className="w-full py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 text-lg flex items-center justify-center gap-2">
            Submit request <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Live estimate sidebar */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-blue-200 font-semibold">Live estimate</p>
              <p className="font-display text-3xl mt-1">GH₵{estimate.total.toLocaleString()}</p>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {estimate.floorArea > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-slate-600 text-xs">Estimated floor area</span>
                  <span className="font-semibold text-slate-900 text-sm">{estimate.floorArea} sqm</span>
                </div>
              )}
              <Row label="Substructure & superstructure" value={estimate.substructure} />
              <Row label="Plumbing, electricals & finishing" value={estimate.finishing} />
              <Row label="Furnishing & appliances" value={estimate.furnishing} />
              <Row label="Utilities & external works" value={estimate.utilities} />
              {estimate.features > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <Row label="Additional features" value={estimate.features} />
                </div>
              )}
              <div className="border-t border-slate-200 pt-3 mt-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Quality tier</p>
                <p className="font-semibold text-slate-900">{TIERS[f.tier].label}</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Based on 2026 Ghana market rates. Final cost confirmed after site inspection. 60% deposit to commence work.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600 text-xs">{label}</span>
      <span className="font-medium text-slate-900 text-sm">GH₵{value.toLocaleString()}</span>
    </div>
  );
}
