"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plane, Calendar, Users, MapPin, CheckCircle, ArrowRight, Star, Bed, Utensils, Shield, Briefcase, Heart } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { mergeWithSeed } from "@/lib/contentStore";
import { pay } from "@/lib/payments";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

type Trip = {
  id: string;
  name: string;
  slug?: string;
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
};

const seedTrips: Trip[] = [
  {
    id: "dubai-5d", name: "Dubai Luxury Escape", duration: "5 Days / 4 Nights", price: 8500,
    departureDate: "2026-03-15", availableSlots: 12, rating: 4.9, reviews: 234,
    image: "https://images.unsplash.com/photo-1512453979798-5ea904ac22ac?w=1200&q=80",
    description: "Skyline views, desert safari, and five-star hospitality in the city of gold.",
    includes: ["Return Flight Tickets", "4-Star Hotel Accommodation", "Daily Breakfast", "Burj Khalifa & Dubai Mall", "Desert Safari", "Airport Transfers", "Travel Insurance", "Visa Assistance"],
    itinerary: ["Day 1: Arrival & check-in", "Day 2: Burj Khalifa & Dubai Mall", "Day 3: Desert Safari", "Day 4: Palm Jumeirah & Marina", "Day 5: Departure"],
  },
  {
    id: "bali-7d", name: "Bali Paradise Adventure", duration: "7 Days / 6 Nights", price: 6800,
    departureDate: "2026-03-20", availableSlots: 8, rating: 4.8, reviews: 189,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    description: "Rice terraces, temples, and beaches — a seven-day reset on the island of the gods.",
    includes: ["Return Flight Tickets", "5-Star Resort", "Daily Breakfast & 2 Dinners", "Ubud Temple Tour", "Beach Club", "Water Sports", "Airport Transfers", "Travel Insurance"],
    itinerary: ["Day 1: Arrive Denpasar", "Day 2: Ubud Temples", "Day 3: Water Sports", "Day 4: Beach Day", "Day 5: Nusa Penida", "Day 6: Free Day", "Day 7: Departure"],
  },
  {
    id: "paris-6d", name: "Paris Romantic Getaway", duration: "6 Days / 5 Nights", price: 9200,
    departureDate: "2026-04-01", availableSlots: 6, rating: 4.9, reviews: 312,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
    description: "The city of light — Eiffel, Louvre, Seine cruise, and patisserie mornings.",
    includes: ["Return Flight Tickets", "4-Star Hotel (City Centre)", "Daily Breakfast", "Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Airport Transfers", "Travel Insurance"],
    itinerary: ["Day 1: Arrival & Eiffel", "Day 2: Louvre", "Day 3: Versailles", "Day 4: Seine Cruise", "Day 5: Montmartre", "Day 6: Departure"],
  },
  {
    id: "safari-8d", name: "Kenya Safari Adventure", duration: "8 Days / 7 Nights", price: 15500,
    departureDate: "2026-04-10", availableSlots: 10, rating: 5.0, reviews: 156,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
    description: "Masai Mara, Lake Nakuru, Amboseli — the great migration up close.",
    includes: ["Return Flight Tickets", "Safari Lodge", "All Meals", "Game Drives", "Professional Guide", "Park Fees", "Airport Transfers", "Travel Insurance"],
    itinerary: ["Day 1: Arrive Nairobi", "Day 2-4: Masai Mara", "Day 5: Lake Nakuru", "Day 6: Amboseli", "Day 7: Return Nairobi", "Day 8: Departure"],
  },
  {
    id: "maldives-6d", name: "Maldives Overwater Retreat", duration: "6 Days / 5 Nights", price: 18900,
    departureDate: "2026-05-02", availableSlots: 6, rating: 5.0, reviews: 98,
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80",
    description: "Overwater villa, private reef, spa days, and sunset dolphin cruises.",
    includes: ["Return Flight Tickets", "Overwater Villa", "All-Inclusive Meals", "Speedboat Transfers", "Snorkelling & Diving", "Spa Credit GH₵2,000", "Sunset Dolphin Cruise", "Travel Insurance"],
    itinerary: ["Day 1: Arrive Malé, speedboat transfer", "Day 2: Reef snorkelling", "Day 3: Spa day", "Day 4: Dolphin cruise + beach", "Day 5: Free / diving", "Day 6: Departure"],
  },
  {
    id: "zanzibar-7d", name: "Zanzibar Spice & Sea", duration: "7 Days / 6 Nights", price: 9800,
    departureDate: "2026-05-18", availableSlots: 14, rating: 4.9, reviews: 142,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1200&q=80",
    description: "Stone Town heritage, spice plantations, Nungwi beaches, Jozani forest.",
    includes: ["Return Flight Tickets", "Beachfront Resort", "Daily Breakfast & 3 Dinners", "Stone Town Tour", "Spice Plantation Visit", "Jozani Forest", "Snorkelling Trip", "Airport Transfers"],
    itinerary: ["Day 1: Arrive Zanzibar", "Day 2: Stone Town heritage", "Day 3: Spice tour", "Day 4: Jozani forest", "Day 5: Nungwi beach + snorkel", "Day 6: Free day", "Day 7: Departure"],
  },
];

export default function TravelTripsPage() {
  const trips = useMemo(() => mergeWithSeed(seedTrips, "trips") as Trip[], []);
  const [selected, setSelected] = useState<Trip | null>(null);
  const [form, setForm] = useState({ travelers: "1", roomType: "standard", firstName: "", lastName: "", email: "", phone: "", passport: "" });
  const [done, setDone] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("ff_wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("ff_wishlist", JSON.stringify(next));
  };

  const roomOpts = [
    { id: "standard", name: "Standard Room", extra: 0 },
    { id: "deluxe", name: "Deluxe Room", extra: 1500 },
    { id: "suite", name: "Executive Suite", extra: 3500 },
  ];
  const room = roomOpts.find((r) => r.id === form.roomType)!;
  const total = selected ? (selected.price + room.extra) * parseInt(form.travelers) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    pay({
      amountGHS: total,
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      onSuccess: async (reference) => {
        await addSubmission({
          type: "travel",
          total,
          currency: "GHS",
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
          summary: `${selected.name} · ${form.travelers} traveller${form.travelers === "1" ? "" : "s"} · departs ${selected.departureDate}`,
          payload: { tripId: selected.id, tripName: selected.name, duration: selected.duration, departureDate: selected.departureDate, travelers: form.travelers, roomType: room.name, passport: form.passport, reference },
        });
        setDone(true);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950" />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300 font-semibold mb-4 flex items-center gap-2"><span className="w-6 h-[1px] bg-cyan-400" /> Travel desk · {trips.length} trips open</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mb-5 max-w-4xl">Buy a slot. We handle the rest — flights, hotels, food, guides.</h1>
          <p className="text-white/70 text-lg max-w-2xl">Pick a trip below, choose your room and party size, and pay to lock your seat. Everything is packaged.</p>
        </div>
      </section>

      <ServiceInfoBanner slug="travel-trips" />

      {/* Trips */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trips.map((t, i) => {
            const isFav = favorites.includes(t.id);
            return (
              <article key={t.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all animate-rise" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest">{t.availableSlots} slots left</span>
                  </div>
                  <div className="absolute top-4 right-14 px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {t.rating.toFixed(1)}
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(t.id, e)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full shadow flex items-center justify-center transition-all ${
                      isFav ? "bg-red-500 text-white" : "bg-white/90 text-slate-600 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                  </button>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase tracking-widest text-cyan-300 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Departs {t.departureDate}</p>
                    <h3 className="font-display text-2xl leading-tight">{t.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{t.duration}</p>
                  </div>
                </div>

                <div className="p-6">
                  {t.description && <p className="text-slate-600 mb-5">{t.description}</p>}

                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Package includes</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {t.includes.slice(0, 8).map((x) => (
                        <p key={x} className="text-sm text-slate-700 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" /> {x}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="font-display text-3xl text-slate-900">GH₵{t.price.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">per person · all inclusive</p>
                    </div>
                    <button onClick={() => { setSelected(t); setDone(false); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-cyan-500 transition-colors">Buy a slot</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Booking drawer */}
      {selected && !done && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-[slideInRight_.3s_ease]">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-600 font-semibold">Reserve your slot</p>
                <h2 className="font-display text-xl text-slate-900 leading-none mt-1">{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">✕</button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2"><Users className="w-3.5 h-3.5 inline mr-1" /> Number of travellers</label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4"].map((n) => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, travelers: n })} className={`py-2.5 rounded-lg text-sm font-semibold ${form.travelers === n ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{n}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2"><Bed className="w-3.5 h-3.5 inline mr-1" /> Room type</label>
                <div className="space-y-2">
                  {roomOpts.map((r) => (
                    <label key={r.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${form.roomType === r.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200"}`}>
                      <span className="flex items-center gap-2">
                        <input type="radio" name="room" checked={form.roomType === r.id} onChange={() => setForm({ ...form, roomType: r.id })} className="accent-cyan-600" />
                        <span className="font-medium text-slate-900">{r.name}</span>
                      </span>
                      <span className="text-sm text-slate-500">{r.extra === 0 ? "Included" : `+GH₵${r.extra.toLocaleString()}`}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                <input required placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
                <input required placeholder="Passport number" value={form.passport} onChange={(e) => setForm({ ...form, passport: e.target.value })} className="col-span-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500" />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Trip × {form.travelers}</span><span>GH₵{(selected.price * parseInt(form.travelers)).toLocaleString()}</span></div>
                {room.extra > 0 && <div className="flex justify-between text-slate-600"><span>{room.name} × {form.travelers}</span><span>GH₵{(room.extra * parseInt(form.travelers)).toLocaleString()}</span></div>}
                <div className="flex justify-between font-display text-lg text-slate-900 pt-2 border-t border-slate-200"><span>Total</span><span>GH₵{total.toLocaleString()}</span></div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-start gap-1.5"><Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> 70% secures your slot; balance due 30 days before departure.</p>

              <button type="submit" className="w-full py-3.5 rounded-full bg-cyan-600 text-white font-semibold hover:bg-cyan-700 flex items-center justify-center gap-2">Pay & book <ArrowRight className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}

      {done && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-10 h-10 text-emerald-600" /></div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Slot booked</h3>
            <p className="text-slate-600 mb-2">{selected.name} · {form.travelers} traveller{form.travelers === "1" ? "" : "s"}</p>
            <p className="font-display text-3xl text-cyan-600 mb-6">GH₵{total.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mb-5">Visa-assistance details will follow.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => { setDone(false); setSelected(null); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Done</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
