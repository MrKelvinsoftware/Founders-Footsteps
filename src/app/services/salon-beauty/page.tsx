"use client";

import { useState, useMemo } from "react";
import { Scissors, ChevronLeft, ChevronRight, Clock, CheckCircle2, ArrowRight, CreditCard, Wallet } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

const SERVICES = [
  { id: "haircut", name: "Haircut & Style", price: 150, duration: 45 },
  { id: "coloring", name: "Hair Coloring", price: 450, duration: 120 },
  { id: "braiding", name: "Braids (Various)", price: 350, duration: 180 },
  { id: "weave", name: "Weave / Wig Install", price: 500, duration: 120 },
  { id: "facial", name: "Facial Treatment", price: 250, duration: 60 },
  { id: "manicure", name: "Manicure", price: 120, duration: 45 },
  { id: "pedicure", name: "Pedicure", price: 150, duration: 60 },
  { id: "massage", name: "Full Body Massage", price: 400, duration: 90 },
  { id: "bridal", name: "Bridal Package", price: 2500, duration: 240 },
  { id: "makeup", name: "Professional Makeup", price: 350, duration: 60 },
  { id: "spa", name: "Spa Package", price: 800, duration: 180 },
  { id: "nails-art", name: "Nail Art & Extensions", price: 200, duration: 90 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function isBooked(dateStr: string, time: string): boolean {
  let h = 0;
  const s = dateStr + time;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 5 === 0;
}

export default function SalonPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "at-shop">("online");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const totalPrice = SERVICES.filter((s) => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
  const totalDuration = SERVICES.filter((s) => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.duration, 0);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const canGoBack = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

  const dateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const isPast = (d: Date) => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  const toggleService = (id: string) => setSelectedServices((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addSubmission({
      type: "salon",
      total: totalPrice,
      currency: "GHS",
      customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
      summary: `Salon · ${selectedDate} ${selectedTime} · ${selectedServices.length} service(s) · ${paymentMethod}`,
      payload: { kind: "salon", date: selectedDate, time: selectedTime, services: selectedServices.map((id) => SERVICES.find((s) => s.id === id)), totalDuration, paymentMethod, notes: form.notes },
    });
    if (res) {
      setSubmitted(true);
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  const ready = selectedDate && selectedTime && selectedServices.length > 0 && form.firstName && form.email && form.phone;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fdf7fb] py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center border border-pink-100">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10 text-pink-600" /></div>
            <h2 className="font-display text-3xl text-slate-900 mb-3">Appointment booked</h2>
            <p className="text-slate-600 mb-2">{selectedDate} at {selectedTime} · {selectedServices.length} service(s)</p>
            <p className="font-display text-2xl text-pink-600 mb-4">GH₵{totalPrice.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mb-5">{paymentMethod === "online" ? "Payment confirmed. See you soon!" : "Pay at the salon — arrive 10 minutes early."}</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => setSubmitted(false)} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Book another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf7fb]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 to-slate-950" />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <p className="text-[11px] uppercase tracking-[0.28em] text-pink-300 font-semibold mb-3">Salon & beauty</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[0.95] max-w-3xl">Pick a day. Pick a time. We&rsquo;ll have your chair ready.</h1>
          <p className="text-white/70 mt-4 max-w-2xl">Live availability · Jan–Dec · Mon–Sun · 9am–6pm. Pay online to lock your slot, or pay at the salon.</p>
        </div>
      </section>

      <ServiceInfoBanner slug="salon-beauty" />

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {/* Calendar */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <button type="button" onClick={prevMonth} disabled={!canGoBack} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="font-display text-xl text-slate-900">{MONTHS[month]} {year}</h2>
              <button type="button" onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => <div key={d} className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-semibold py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => {
                if (!d) return <div key={i} />;
                const ds = dateStr(d);
                const past = isPast(d);
                const sel = selectedDate === ds;
                const isToday = ds === dateStr(today);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={past}
                    onClick={() => { setSelectedDate(ds); setSelectedTime(""); }}
                    className={`aspect-square rounded-lg text-sm font-medium transition ${
                      sel ? "bg-pink-600 text-white shadow-md" :
                      past ? "text-slate-300 cursor-not-allowed" :
                      isToday ? "ring-2 ring-pink-400 text-pink-700 hover:bg-pink-50" :
                      "text-slate-700 hover:bg-pink-50"
                    }`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Time slots */}
          {selectedDate && (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 animate-[rise_.3s_ease]">
              <h2 className="font-display text-xl text-slate-900 mb-1 flex items-center gap-2"><Clock className="w-5 h-5 text-pink-600" /> {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</h2>
              <p className="text-sm text-slate-500 mb-4">Select an available time slot</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {TIME_SLOTS.map((t) => {
                  const booked = isBooked(selectedDate, t);
                  const sel = selectedTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition ${
                        sel ? "bg-pink-600 text-white" :
                        booked ? "bg-slate-100 text-slate-300 line-through cursor-not-allowed" :
                        "bg-slate-50 text-slate-700 hover:bg-pink-50 hover:text-pink-700"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Services */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
            <h2 className="font-display text-xl text-slate-900 mb-4">Choose services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SERVICES.map((s) => {
                const sel = selectedServices.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${sel ? "border-pink-500 bg-pink-50" : "border-slate-200 hover:border-pink-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded border flex items-center justify-center ${sel ? "bg-pink-600 border-pink-600" : "border-slate-300"}`}>
                        {sel && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.duration} min</p>
                      </div>
                    </div>
                    <span className="font-semibold text-pink-600 text-sm">GH₵{s.price}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Contact + payment */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4">
            <h2 className="font-display text-xl text-slate-900">Your details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-500" />
              <input required placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-500" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-500" />
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-500" />
              <textarea placeholder="Special requests (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="md:col-span-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-pink-500 resize-none" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">Payment</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPaymentMethod("online")} className={`p-3 rounded-xl border-2 text-left transition ${paymentMethod === "online" ? "border-pink-500 bg-pink-50" : "border-slate-200"}`}>
                  <CreditCard className="w-5 h-5 text-pink-600 mb-1" />
                  <p className="font-semibold text-sm text-slate-900">Pay online</p>
                  <p className="text-xs text-slate-500">Lock your slot now</p>
                </button>
                <button type="button" onClick={() => setPaymentMethod("at-shop")} className={`p-3 rounded-xl border-2 text-left transition ${paymentMethod === "at-shop" ? "border-pink-500 bg-pink-50" : "border-slate-200"}`}>
                  <Wallet className="w-5 h-5 text-pink-600 mb-1" />
                  <p className="font-semibold text-sm text-slate-900">Pay at salon</p>
                  <p className="text-xs text-slate-500">Settle on the day</p>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-pink-600 text-white px-6 py-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pink-200 font-semibold">Your appointment</p>
              <p className="font-display text-2xl mt-1">{selectedDate || "—"} {selectedTime || ""}</p>
              {selectedServices.length > 0 && <p className="text-sm text-pink-100 mt-1">{totalDuration} min · {selectedServices.length} service(s)</p>}
            </div>
            <div className="p-6 space-y-2 text-sm max-h-64 overflow-y-auto">
              {selectedServices.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No services selected yet</p>
              ) : (
                SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => (
                  <div key={s.id} className="flex justify-between"><span className="text-slate-700">{s.name}</span><span className="font-medium text-slate-900">GH₵{s.price}</span></div>
                ))
              )}
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex items-baseline justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-display text-2xl text-pink-600">GH₵{totalPrice.toLocaleString()}</span>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={submit}>
                <button type="submit" disabled={!ready} className="w-full py-3.5 rounded-full bg-slate-900 text-white font-semibold disabled:opacity-40 hover:bg-pink-600 flex items-center justify-center gap-2">
                  {paymentMethod === "online" ? "Pay & book" : "Confirm booking"} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </aside>
      </div>
      <style jsx global>{`@keyframes rise { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }`}</style>
    </div>
  );
}
