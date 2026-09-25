"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, CheckCircle, Eye, EyeOff,
  Palette, Sparkles, FileText, Layers, PenTool
} from "lucide-react";

const STORAGE_KEY = "ff_admin_pricing";

type DesignService = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "branding" | "print" | "digital" | "packaging";
  deliverables: string[];
  turnaround: string;
  enabled: boolean;
};

const defaultServices: DesignService[] = [
  // Branding
  { id: "gd-1", name: "Logo Design (Basic)", price: 500, category: "branding", description: "2 initial concepts with 2 rounds of revisions", deliverables: ["PNG, JPG, SVG files", "Black & white versions", "Brand color codes"], turnaround: "5-7 days", enabled: true },
  { id: "gd-2", name: "Logo Design (Premium)", price: 1500, category: "branding", description: "5 initial concepts with unlimited revisions", deliverables: ["All file formats", "Brand guidelines", "Social media kit", "Stationery mockups"], turnaround: "10-14 days", enabled: true },
  { id: "gd-12", name: "Brand Identity Package", price: 3500, category: "branding", description: "Complete brand identity from scratch", deliverables: ["Logo design", "Color palette", "Typography", "Brand guidelines PDF", "Business card", "Letterhead"], turnaround: "3-4 weeks", enabled: true },

  // Print
  { id: "gd-3", name: "Business Card Design", price: 200, category: "print", description: "Professional double-sided business card", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "2-3 days", enabled: true },
  { id: "gd-4", name: "Letterhead Design", price: 150, category: "print", description: "Corporate letterhead template", deliverables: ["Print-ready PDF", "Word template", "Source files"], turnaround: "2-3 days", enabled: true },
  { id: "gd-5", name: "Brochure Design (Tri-fold)", price: 400, category: "print", description: "6-panel tri-fold brochure", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "4-5 days", enabled: true },
  { id: "gd-6", name: "Flyer Design", price: 250, category: "print", description: "Single-page promotional flyer", deliverables: ["Print-ready PDF", "Web version", "Source files"], turnaround: "2-3 days", enabled: true },
  { id: "gd-7", name: "Poster Design", price: 350, category: "print", description: "Large format poster design", deliverables: ["Print-ready PDF", "Multiple sizes", "Source files"], turnaround: "3-4 days", enabled: true },
  { id: "gd-14", name: "Menu Design", price: 600, category: "print", description: "Restaurant menu layout", deliverables: ["Print-ready PDF", "Editable template", "2 revisions"], turnaround: "5-7 days", enabled: true },
  { id: "gd-16", name: "Invitation Design", price: 300, category: "print", description: "Event invitations", deliverables: ["Print-ready PDF", "Digital version", "RSVP card"], turnaround: "3-4 days", enabled: true },

  // Digital
  { id: "gd-8", name: "Social Media Kit", price: 800, category: "digital", description: "10 customizable post templates", deliverables: ["Instagram, Facebook, LinkedIn", "Story templates", "Canva templates"], turnaround: "5-7 days", enabled: true },
  { id: "gd-9", name: "Social Media Post", price: 100, category: "digital", description: "Single social media post design", deliverables: ["Optimized for platform", "Caption suggestions", "Hashtag research"], turnaround: "1-2 days", enabled: true },
  { id: "gd-10", name: "Web Banner Design", price: 200, category: "digital", description: "Website banner/header image", deliverables: ["Multiple sizes", "Optimized for web", "Source files"], turnaround: "2-3 days", enabled: true },
  { id: "gd-18", name: "Infographic Design", price: 500, category: "digital", description: "Data visualization infographic", deliverables: ["High-res PNG/PDF", "Editable source", "2 revisions"], turnaround: "4-5 days", enabled: true },
  { id: "gd-15", name: "Book Cover Design", price: 800, category: "digital", description: "Front cover and spine design", deliverables: ["Print-ready PDF", "eBook cover", "3D mockup"], turnaround: "5-7 days", enabled: true },

  // Packaging
  { id: "gd-13", name: "Packaging Design", price: 1200, category: "packaging", description: "Product packaging design", deliverables: ["Dieline template", "3D mockups", "Print-ready files"], turnaround: "7-10 days", enabled: true },
  { id: "gd-11", name: "Print Banner Design", price: 300, category: "packaging", description: "Roll-up/outdoor banner", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "3-4 days", enabled: true },
  { id: "gd-17", name: "T-Shirt Design", price: 250, category: "packaging", description: "Custom apparel graphics", deliverables: ["Print-ready files", "Mockup images", "Color separations"], turnaround: "3-4 days", enabled: true },
];

const categories = [
  { id: "branding", name: "Branding & Identity", icon: Sparkles, color: "#f97316" },
  { id: "print", name: "Print Design", icon: FileText, color: "#3b82f6" },
  { id: "digital", name: "Digital Design", icon: Layers, color: "#8b5cf6" },
  { id: "packaging", name: "Packaging & Merch", icon: PenTool, color: "#10b981" },
];

export default function AdminGraphicDesignPage() {
  const [services, setServices] = useState<DesignService[]>(defaultServices);
  const [activeCategory, setActiveCategory] = useState<string>("branding");
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const adminPrices = parsed["graphic-design"] || [];
        if (adminPrices.length > 0) {
          const priceMap = new Map(adminPrices.map((p: DesignService) => [p.id, p]));
          setServices(defaultServices.map(s => {
            const saved = priceMap.get(s.id) as DesignService | undefined;
            return saved ? { ...s, ...saved } : s;
          }));
        }
      } catch (e) {
        console.error("Failed to load graphic design prices:", e);
      }
    }
  }, []);

  const saveConfig = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    existing["graphic-design"] = services.map(s => ({
      id: s.id,
      name: s.name,
      price: s.price,
      description: s.description,
      deliverables: s.deliverables,
      turnaround: s.turnaround,
      enabled: s.enabled,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateService = (id: string, updates: Partial<DesignService>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const filteredServices = services.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/services" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-orange-600 font-semibold">Creative Studio CMS</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Graphic Design Pricing</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
            <button onClick={saveConfig} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-4 sticky top-[73px] self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Categories</p>
          <nav className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              const count = services.filter(s => s.category === cat.id && s.enabled).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive ? "bg-orange-600 text-white" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{cat.name}</span>
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
          
          <div className="mt-8 p-4 bg-orange-50 rounded-xl">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <Palette className="w-5 h-5" />
              <span className="font-semibold text-sm">Quick Stats</span>
            </div>
            <p className="text-sm text-slate-600">
              <strong>{services.filter(s => s.enabled).length}</strong> services active
            </p>
            <p className="text-sm text-slate-600">
              Avg price: <strong>GH₵{Math.round(services.reduce((a, b) => a + b.price, 0) / services.length).toLocaleString()}</strong>
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-slate-500">Edit prices, descriptions, and toggle service visibility</p>
              </div>
            </div>

            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl border p-5 transition-all ${
                    service.enabled ? "border-slate-200" : "border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, { name: e.target.value })}
                          className="font-semibold text-lg text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none"
                        />
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {service.turnaround}
                        </span>
                      </div>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, { description: e.target.value })}
                        className="w-full text-sm text-slate-600 bg-transparent border border-transparent hover:border-slate-200 focus:border-orange-500 focus:outline-none rounded-lg p-2 -ml-2 resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <label className="text-xs text-slate-500 block mb-1">Price (GH₵)</label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateService(service.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-28 px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none text-right font-display text-lg text-orange-600"
                        />
                      </div>
                      <button
                        onClick={() => updateService(service.id, { enabled: !service.enabled })}
                        className={`p-2 rounded-lg ${service.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {service.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Deliverables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {service.deliverables.map((d, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-slate-500">Turnaround Time</label>
                        <input
                          type="text"
                          value={service.turnaround}
                          onChange={(e) => updateService(service.id, { turnaround: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-500 focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
