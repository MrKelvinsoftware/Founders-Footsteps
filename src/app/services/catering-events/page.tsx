"use client";

import { useMemo, useState, useEffect } from "react";
import { Calendar, Users, Utensils, Wine, Sparkles, CheckCircle2, ArrowRight, Receipt, Minus, Plus } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { useAuth } from "@/components/AuthProvider";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

type F = {
  eventType: string; eventDate: string; eventTime: string; venue: string; numberOfGuests: string;
  localDishes: string[]; continentalDishes: string[]; softDrinks: string[]; hardDrinks: string[]; additionalServices: string[];
  firstName: string; lastName: string; email: string; phone: string;
};

const EVENT_TYPES = [
  { id: "wedding", name: "Wedding" }, { id: "corporate", name: "Corporate" }, { id: "birthday", name: "Birthday" },
  { id: "funeral", name: "Funeral" }, { id: "engagement", name: "Engagement" }, { id: "other", name: "Other" },
];

const LOCAL = [
  { name: "Jollof Rice & Chicken", price: 85 }, { name: "Waakye Special", price: 65 }, { name: "Fufu & Light Soup", price: 75 },
  { name: "Banku & Tilapia", price: 95 }, { name: "Red Red & Fried Plantain", price: 55 }, { name: "Groundnut Soup", price: 70 },
  { name: "Kontomire Stew", price: 65 }, { name: "Tuo Zaafi", price: 70 },
];
const CONTINENTAL = [
  { name: "Grilled Salmon", price: 145 }, { name: "Beef Steak", price: 125 }, { name: "Chicken Alfredo", price: 95 },
  { name: "Fried Rice & Prawns", price: 105 }, { name: "Pasta Carbonara", price: 85 }, { name: "Grilled Chicken", price: 75 },
  { name: "Caesar Salad", price: 65 }, { name: "Lamb Chops", price: 135 },
];
const SOFT = [
  { name: "Coca Cola", price: 8 }, { name: "Fanta", price: 8 }, { name: "Sprite", price: 8 }, { name: "Soda Water", price: 6 },
  { name: "Juice Pack", price: 12 }, { name: "Fresh Juice", price: 25 }, { name: "Smoothie", price: 30 },
];
const HARD = [
  { name: "Club Beer", price: 15 }, { name: "Guinness", price: 18 }, { name: "Red Label Whisky", price: 35 },
  { name: "Gordon's Gin", price: 30 }, { name: "Hennessy Cognac", price: 65 }, { name: "Wine (Glass)", price: 45 }, { name: "Champagne", price: 85 },
];
const SERVICES = [
  { name: "DJ Services", price: 2500 }, { name: "Live Band", price: 5000 }, { name: "Event Decor", price: 3500 },
  { name: "Photography", price: 2000 }, { name: "Video Coverage", price: 2500 }, { name: "MC / Host", price: 1500 },
  { name: "Security", price: 800 }, { name: "Valet Parking", price: 600 },
];

const priceOf = (list: { name: string; price: number }[], name: string) => list.find((x) => x.name === name)?.price ?? 0;

export default function CateringEventsPage() {
  const { user } = useAuth();
  const [f, setF] = useState<F>({
    eventType: "wedding", eventDate: "", eventTime: "", venue: "", numberOfGuests: "80",
    localDishes: ["Jollof Rice & Chicken", "Waakye Special"],
    continentalDishes: ["Grilled Chicken"],
    softDrinks: ["Coca Cola", "Juice Pack"],
    hardDrinks: [],
    additionalServices: ["Event Decor"],
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setF((p) => ({
        ...p,
        firstName: user.firstName || p.firstName,
        lastName: user.lastName || p.lastName,
        email: user.email || p.email,
      }));
    }
  }, [user]);

  const toggle = (key: keyof F, value: string) => {
    setF((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };
  const setGuests = (d: number) => setF((p) => ({ ...p, numberOfGuests: String(Math.max(20, (parseInt(p.numberOfGuests) || 80) + d)) }));

  // Live pricing — recomputes on every selection. Base 45,000 covers venue, staff and a standard buffet for up to 95 guests.
  const quote = useMemo(() => {
    const guests = Math.max(20, parseInt(f.numberOfGuests) || 80);
    const base = 45000 + Math.max(0, guests - 95) * 450;
    const food = [...f.localDishes, ...f.continentalDishes].reduce((s, n) => {
      const list = LOCAL.some((x) => x.name === n) ? LOCAL : CONTINENTAL;
      return s + priceOf(list, n) * guests;
    }, 0);
    const drinks = [...f.softDrinks, ...f.hardDrinks].reduce((s, n) => {
      const list = SOFT.some((x) => x.name === n) ? SOFT : HARD;
      return s + priceOf(list, n) * guests;
    }, 0);
    const services = f.additionalServices.reduce((s, n) => s + priceOf(SERVICES, n), 0);
    return { guests, base, food, drinks, services, total: base + food + drinks + services };
  }, [f]);

  const ready = f.localDishes.length + f.continentalDishes.length > 0 && f.softDrinks.length + f.hardDrinks.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    await addSubmission({
      type: "event", total: quote.total, currency: "GHS",
      customer: { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone },
      summary: `${f.eventType} · ${quote.guests} guests · ${f.eventDate || "date TBC"}`,
      payload: { eventType: f.eventType, eventDate: f.eventDate, eventTime: f.eventTime, venue: f.venue, numberOfGuests: String(quote.guests), localDishes: f.localDishes, continentalDishes: f.continentalDishes, softDrinks: f.softDrinks, hardDrinks: f.hardDrinks, additionalServices: f.additionalServices, quote },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fbf7f0] py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-amber-100">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10 text-amber-600" /></div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-600 font-semibold mb-2">Booking received</p>
            <h2 className="font-display text-3xl text-slate-900 mb-3">Your event is on our calendar</h2>
            <p className="text-slate-600 mb-5">A planner will call within 4 hours to confirm the menu tasting and venue walk-through. Estimated total <span className="font-display text-amber-600">GH₵{quote.total.toLocaleString()}</span>.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={f.email} phone={f.phone} />
            </div>
            <button onClick={() => { setSubmitted(false); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-amber-600">Plan another event</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7f0]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950" />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300 font-semibold mb-3 flex items-center gap-2"><span className="w-6 h-[1px] bg-amber-400" /> Catering & events</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] max-w-3xl">Build your menu. Watch the price update as you go.</h1>
          <p className="text-white/70 mt-4 max-w-2xl">Pick your dishes, drinks and add-ons — your running total is always visible on the right. Minimum package GH₵45,000 for 80–95 guests.</p>
        </div>
      </section>

      <ServiceInfoBanner slug="catering-events" />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Form */}
        <form onSubmit={submit} className="space-y-10">
          {/* Basics */}
          <Section n="1" title="Event basics">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {EVENT_TYPES.map((t) => (
                <Pill key={t.id} active={f.eventType === t.id} onClick={() => setF({ ...f, eventType: t.id })}>{t.name}</Pill>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Date"><input type="date" value={f.eventDate} onChange={(e) => setF({ ...f, eventDate: e.target.value })} className={inputCls} /></Field>
              <Field label="Time"><input type="time" value={f.eventTime} onChange={(e) => setF({ ...f, eventTime: e.target.value })} className={inputCls} /></Field>
              <Field label="Guests">
                <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setGuests(-5)} className="px-3 py-2 hover:bg-slate-100"><Minus className="w-4 h-4" /></button>
                  <input value={f.numberOfGuests} onChange={(e) => setF({ ...f, numberOfGuests: e.target.value.replace(/\D/g, "") })} className="flex-1 text-center py-2 focus:outline-none" />
                  <button type="button" onClick={() => setGuests(5)} className="px-3 py-2 hover:bg-slate-100"><Plus className="w-4 h-4" /></button>
                </div>
              </Field>
              <Field label="Venue" full><input value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} placeholder="Hotel, home, garden…" className={inputCls} /></Field>
            </div>
          </Section>

          <Section n="2" title="Local dishes" hint="per guest · pick at least one">
            <PillGrid options={LOCAL} selected={f.localDishes} onToggle={(v) => toggle("localDishes", v)} />
          </Section>
          <Section n="3" title="Continental dishes" hint="per guest">
            <PillGrid options={CONTINENTAL} selected={f.continentalDishes} onToggle={(v) => toggle("continentalDishes", v)} />
          </Section>
          <Section n="4" title="Soft drinks" hint="per guest · pick at least one">
            <PillGrid options={SOFT} selected={f.softDrinks} onToggle={(v) => toggle("softDrinks", v)} />
          </Section>
          <Section n="5" title="Hard drinks" hint="per guest">
            <PillGrid options={HARD} selected={f.hardDrinks} onToggle={(v) => toggle("hardDrinks", v)} />
          </Section>
          <Section n="6" title="Add-on services" hint="flat fee">
            <PillGrid options={SERVICES} selected={f.additionalServices} onToggle={(v) => toggle("additionalServices", v)} money />
          </Section>

          <Section n="7" title="Your details">
            {user ? (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="font-semibold text-slate-900">👤 {user.firstName} {user.lastName}</p>
                <p className="text-slate-600 text-sm">{user.email}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required placeholder="First name" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} className={inputCls} />
                <input required placeholder="Last name" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} className={inputCls} />
                <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={inputCls} />
                <input required type="tel" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputCls} />
              </div>
            )}
          </Section>

          {/* mobile total + submit */}
          <div className="lg:hidden sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-300">Live total</p>
              <p className="font-display text-2xl">GH₵{quote.total.toLocaleString()}</p>
            </div>
            <button type="submit" disabled={!ready} className="px-5 py-3 rounded-full bg-amber-500 text-slate-900 font-semibold disabled:opacity-40 flex items-center gap-2">Book now <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="hidden lg:block">
            <button type="submit" disabled={!ready} className="w-full py-4 rounded-full bg-slate-900 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center gap-2">Confirm booking <ArrowRight className="w-4 h-4" /></button>
            {!ready && <p className="text-center text-xs text-slate-500 mt-2">Choose at least one dish and one drink to continue.</p>}
          </div>
        </form>

        {/* Live quote panel */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-300" />
              <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300 font-semibold">Running total</p>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <Row label={`Base · ${quote.guests} guests`} value={quote.base} />
              <Row label={`Food · ${f.localDishes.length + f.continentalDishes.length} dishes`} value={quote.food} muted={quote.food === 0} />
              <Row label={`Drinks · ${f.softDrinks.length + f.hardDrinks.length} types`} value={quote.drinks} muted={quote.drinks === 0} />
              <Row label={`Services · ${f.additionalServices.length}`} value={quote.services} muted={quote.services === 0} />
              <div className="border-t border-slate-200 pt-3 mt-3 flex items-end justify-between">
                <span className="font-semibold text-slate-900">Estimated total</span>
                <span className="font-display text-3xl text-amber-600 leading-none">GH₵{quote.total.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">70% deposit secures your date; balance due 7 days before the event. Final figure confirmed after tasting.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-500 bg-white";

function Section({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-display text-2xl text-amber-600 leading-none">{n}</span>
        <h2 className="font-display text-xl text-slate-900">{title}</h2>
        {hint && <span className="text-xs text-slate-500">· {hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={`block ${full ? "md:col-span-3" : ""}`}><span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1 block">{label}</span>{children}</label>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${active ? "bg-amber-500 border-amber-500 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:border-amber-300"}`}>
      {children}
    </button>
  );
}

function PillGrid({ options, selected, onToggle, money }: { options: { name: string; price: number }[]; selected: string[]; onToggle: (v: string) => void; money?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.name);
        return (
          <button type="button" key={o.name} onClick={() => onToggle(o.name)} className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${on ? "bg-amber-500 border-amber-500 text-slate-900" : "bg-white border-slate-200 text-slate-700 hover:border-amber-300"}`}>
            <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-slate-900 border-slate-900" : "border-slate-300"}`}>
              {on && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
            </span>
            <span className="font-medium">{o.name}</span>
            <span className={`text-xs ${on ? "text-slate-900/70" : "text-slate-400"}`}>{money ? `GH₵${o.price.toLocaleString()}` : `GH₵${o.price}`}</span>
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className={`font-medium ${muted ? "text-slate-300" : "text-slate-900"}`}>GH₵{value.toLocaleString()}</span>
    </div>
  );
}
