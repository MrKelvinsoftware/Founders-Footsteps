"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Car, Calendar, Users, MapPin, Fuel, Settings2, CheckCircle, ArrowRight, Search, Heart } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import NotifyStatus from "@/components/NotifyStatus";
import { mergeWithSeed } from "@/lib/contentStore";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";
import { useAuth } from "@/components/AuthProvider";
import { pay } from "@/lib/payments";

const seedCars = [
  { id: "eco", name: "Hyundai Accent", category: "Economy", transmission: "Manual", fuel: "Petrol", seats: 5, luggage: 2, daily: 350, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", features: ["AC", "Bluetooth", "Power Windows"] },
  { id: "compact", name: "Toyota Corolla", category: "Compact", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 3, daily: 450, image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80", features: ["AC", "Reverse Camera", "Cruise Control"] },
  { id: "sedan", name: "Toyota Camry", category: "Sedan", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 4, daily: 650, image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80", features: ["AC", "Leather Seats", "Sunroof", "Reverse Camera"] },
  { id: "suv", name: "Toyota RAV4", category: "SUV", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 5, daily: 850, image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", features: ["AC", "4WD", "Bluetooth", "Cruise Control"] },
  { id: "luxury", name: "Mercedes-Benz E-Class", category: "Luxury", transmission: "Automatic", fuel: "Petrol", seats: 5, luggage: 4, daily: 1500, image: "https://images.unsplash.com/photo-1618843479313-6f7a4d6f3f9b?w=800&q=80", features: ["Leather", "Sunroof", "Premium Audio", "Climate Control"] },
  { id: "van", name: "Hyundai H1", category: "Van", transmission: "Automatic", fuel: "Diesel", seats: 9, luggage: 6, daily: 950, image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80", features: ["AC", "9 Seater", "Large Luggage"] },
];

const categories = ["All", "Economy", "Compact", "Sedan", "SUV", "Luxury", "Van"];

export default function CarRentalPage() {
  const { user } = useAuth();
  const cars = useMemo(() => mergeWithSeed(seedCars, "cars" as any) as typeof seedCars, []);
  const [category, setCategory] = useState("All");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("");
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

  const days = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const a = new Date(pickupDate).getTime();
    const b = new Date(returnDate).getTime();
    return Math.max(1, Math.ceil((b - a) / 86400000));
  }, [pickupDate, returnDate]);

  const filtered = cars.filter((c) => {
    if (category !== "All" && c.category !== category) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const [bookedCar, setBookedCar] = useState<typeof seedCars[number] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "" });
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);

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

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookedCar) return;
    setPaying(true);
    const totalAmount = bookedCar.daily * days;
    const customerEmail = user?.email || form.email;
    const customerName = user ? `${user.firstName} ${user.lastName}` : form.name;

    pay({
      amountGHS: totalAmount,
      email: customerEmail,
      name: customerName,
      onSuccess: async (reference) => {
        const res = await addSubmission({
          type: "car-rental",
          total: totalAmount,
          currency: "GHS",
          customer: { 
            firstName: user ? user.firstName : (form.name.split(" ")[0] || "Guest"), 
            lastName: user ? user.lastName : form.name.split(" ").slice(1).join(" "), 
            email: customerEmail, 
            phone: user?.phone || form.phone 
          },
          summary: `${bookedCar.name} · ${days} day${days > 1 ? "s" : ""} · pickup ${pickupDate || "TBC"}`,
          payload: { kind: "car-rental", car: bookedCar.name, category: bookedCar.category, days, pickupDate, returnDate, location: form.location, transmission: bookedCar.transmission, reference },
        });
        setPaying(false);
        if (res) {
          setSubmitted(true);
        } else {
          alert("Something went wrong. Please try again.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-blue-200 font-semibold mb-3">Car Services · Daily & Weekly Rentals</p>
            <h1 className="font-display text-4xl md:text-5xl mb-4 leading-[1.05]">Premium cars. Honest prices. Across Ghana.</h1>
            <p className="text-white/80 text-lg">From economy hatchbacks to luxury sedans, get a clean, well-maintained vehicle delivered to your door — or pick up from any major city.</p>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-3xl p-4 md:p-6 mt-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Pick-up location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Accra, Kumasi, Tamale…" className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Pick-up date</label>
                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Return date</label>
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-slate-200 text-slate-900 text-sm" />
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" /> Search cars
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceInfoBanner slug="car-rental" />

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-500 mr-2">Category</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                category === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Cars grid */}
      <section className="container mx-auto px-4 py-10">
        {days > 1 && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span><strong>{days} day{days > 1 ? "s" : ""}</strong> selected · prices shown below reflect total rental cost</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car) => {
            const isFav = favorites.includes(car.id);
            return (
              <div key={car.id} className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition-all group">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-900">{car.category}</span>
                  <button
                    onClick={(e) => toggleFavorite(car.id, e)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full shadow flex items-center justify-center transition-all ${
                      isFav ? "bg-red-500 text-white" : "bg-white/90 text-slate-600 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-slate-900 mb-1">{car.name}</h3>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-4">
                    <span className="px-2 py-1 bg-slate-100 rounded">{car.transmission}</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">{car.fuel}</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">{car.seats} seats</span>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">GH₵{car.daily.toLocaleString()}<span className="text-sm font-normal text-slate-500">/day</span></p>
                      {days > 1 && <p className="text-xs text-slate-500 mt-0.5">Total: GH₵{(car.daily * days).toLocaleString()}</p>}
                    </div>
                    <button onClick={() => { setBookedCar(car); setSelected(car.id); }} className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking modal */}
      {bookedCar && !submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBookedCar(null)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setBookedCar(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg z-10">
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <form onSubmit={submitBooking} className="p-8">
              <p className="text-[11px] uppercase tracking-widest text-blue-600 font-semibold mb-1">Reserve your vehicle</p>
              <h3 className="font-display text-2xl text-slate-900 mb-1">{bookedCar.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{days} day{days > 1 ? "s" : ""} · Total <span className="font-semibold text-slate-900">GH₵{(bookedCar.daily * days).toLocaleString()}</span></p>

              {user ? (
                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <p className="font-semibold text-blue-900">👤 {user.firstName} {user.lastName}</p>
                  <p className="text-blue-700 text-sm">{user.email}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
                  <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
                  <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => setBookedCar(null)} className="px-4 py-3 rounded-full border border-slate-200 font-semibold text-slate-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700">Confirm booking</button>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">Pay on pickup · No card needed now</p>
            </form>
          </div>
        </div>
      )}

      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Booking confirmed</h3>
            <p className="text-slate-600 mb-5">We&apos;ll deliver your {bookedCar?.name} as arranged.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => { setSubmitted(false); setBookedCar(null); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
