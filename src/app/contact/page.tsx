"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div className="min-h-screen">
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">We&apos;re here to help. Reach out to us with any questions.</p>
        </div>
      </section>
      <section className="py-12 bg-white -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 text-center"><div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4"><Phone className="w-7 h-7 text-blue-600" /></div><h4 className="font-semibold text-slate-900 mb-2">Phone</h4><p className="text-slate-600">0261404904</p></div>
            <div className="card p-6 text-center"><div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4"><Mail className="w-7 h-7 text-green-600" /></div><h4 className="font-semibold text-slate-900 mb-2">Email</h4><p className="text-slate-600">phrimpongkelvin@gmail.com</p></div>
            <div className="card p-6 text-center"><div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-7 h-7 text-purple-600" /></div><h4 className="font-semibold text-slate-900 mb-2">WhatsApp</h4><p className="text-slate-600">0257664762 / 0261404904</p></div>
            <div className="card p-6 text-center"><div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4"><Clock className="w-7 h-7 text-red-600" /></div><h4 className="font-semibold text-slate-900 mb-2">Business Hours</h4><p className="text-slate-600">Mon-Sat: 9am-8pm</p></div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="text-center py-12"><Send className="w-10 h-10 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-slate-900 mb-4">Message Sent!</h3><button onClick={() => setSubmitted(false)} className="btn-primary px-8 py-3">Send Another</button></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="search-input" required />
                  <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="search-input" required />
                  <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="search-input" />
                  <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="search-input" required>
                    <option value="">Select a subject...</option><option value="general">General Inquiry</option><option value="booking">Booking Support</option><option value="partnership">Partnership</option><option value="feedback">Feedback</option>
                  </select>
                </div>
                <textarea placeholder="How can we help you?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="search-input min-h-[150px]" rows={5} required />
                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2"><Send className="w-5 h-5" /> Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
