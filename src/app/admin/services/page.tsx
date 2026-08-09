"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Car, Utensils, Plane, Scissors, Truck, Wrench, ShoppingBag, ChevronRight, Pencil } from "lucide-react";
import { getSubmissions } from "@/lib/submissions";

const lines = [
  { key: "construction", name: "Construction & Real Estate", icon: Home, color: "#64748b", href: "/services/construction", cms: "/admin/content?slug=construction-info", blurb: "New builds, renovations, roofing. Quote requests land in Bookings." },
  { key: "marketplace", name: "Marketplace", icon: ShoppingBag, color: "#ef4444", href: "/marketplace", cms: "/admin/products", blurb: "Orders flow in automatically. Manage the catalogue from Products." },
  { key: "car-rental", name: "Car Services", icon: Car, color: "#2563eb", href: "/services/car-rental", cms: "/admin/content?slug=car-rental-info", blurb: "Rentals and sales. Bookings appear under the Bookings tab." },
  { key: "event", name: "Catering & Events", icon: Utensils, color: "#d97706", href: "/services/catering-events", cms: "/admin/content?slug=catering-events-info", blurb: "Menu-driven quotes with live totals. See them in Bookings." },
  { key: "travel", name: "Travel & Trips", icon: Plane, color: "#0891b2", href: "/services/travel-trips", cms: "/admin/trips", blurb: "Publish trips from the Trips CMS; slot bookings appear instantly." },
  { key: "salon", name: "Salon & Beauty", icon: Scissors, color: "#c026d3", href: "/services/salon-beauty", cms: "/admin/content?slug=salon-beauty-info", blurb: "Appointment bookings with online or pay-at-shop options." },
  { key: "logistics", name: "Logistics", icon: Truck, color: "#059669", href: "/services/logistics", cms: "/admin/content?slug=logistics-info", blurb: "Freight quote requests — domestic and international." },
  { key: "tech-repair", name: "Tech Repairs", icon: Wrench, color: "#7c3aed", href: "/services/tech-repairs", cms: "/admin/content?slug=tech-repairs-info", blurb: "Device repair tickets with pickup option." },
];

export default function AdminServicesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const all = await getSubmissions();
      const m: Record<string, number> = {};
      for (const s of all) m[s.type] = (m[s.type] || 0) + 1;
      setCounts(m);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-6 py-4">
          <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div><p className="text-[11px] uppercase tracking-[0.28em] text-indigo-600 font-semibold">Operations</p><h1 className="font-display text-2xl text-slate-900 leading-none">Service lines</h1></div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {lines.map((l) => {
          const n = counts[l.key] || 0;
          return (
            <div key={l.key} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${l.color}15`, color: l.color }}><l.icon className="w-6 h-6" /></div>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">{n} request{n !== 1 ? "s" : ""}</span>
              </div>
              <h3 className="font-display text-xl text-slate-900 mb-1">{l.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">{l.blurb}</p>
              <div className="flex items-center gap-2">
                <a href={l.href} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 flex items-center gap-1">Public page <ChevronRight className="w-4 h-4" /></a>
                <Link href={l.cms} className="ml-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Pencil className="w-3.5 h-3.5" /> Manage <ChevronRight className="w-4 h-4" /></Link>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
