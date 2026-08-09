"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";
import RequestQuoteModal from "./RequestQuoteModal";
import NewsletterForm from "./NewsletterForm";

const services = [
  { name: "Construction", href: "/services/construction" },
  { name: "Car Services", href: "/services/car-rental" },
  { name: "Catering & Events", href: "/services/catering-events" },
  { name: "Travel & Trips", href: "/services/travel-trips" },
  { name: "Salon & Beauty", href: "/services/salon-beauty" },
  { name: "Logistics", href: "/services/logistics" },
  { name: "Tech Repairs", href: "/services/tech-repairs" },
  { name: "Marketplace", href: "/marketplace" },
];

const company = [
  { name: "About Us", href: "/about" },
  { name: "Our Founder", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Press", href: "/press" },
  { name: "Contact", href: "/contact" },
  { name: "Admin Portal", href: "/admin" },
];

const support = [
  { name: "Help Centre", href: "/help" },
  { name: "FAQs", href: "/faq" },
  { name: "Returns & Refunds", href: "/returns" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="border-b border-white/5">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-8 items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-orange-300 font-semibold mb-2">By the numbers</p>
            <h3 className="font-display text-3xl leading-tight">One company. Eight crafts. Zero strangers.</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[{ n: "8+", l: "Service lines" }, { n: "500+", l: "Products in stock" }, { n: "50K+", l: "Happy customers" }, { n: "100%", l: "Trusted brand" }].map((s, i) => (
              <div key={s.l} className={i === 0 ? "pr-6" : "px-6"}>
                <p className="font-display text-4xl md:text-5xl text-white leading-none">{s.n}</p>
                <p className="text-[11px] uppercase tracking-widest text-white/50 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-12">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-2xl md:text-3xl mb-2">Get exclusive offers & travel inspiration</h3>
            <p className="text-white/80 text-sm">Subscribe to our newsletter for the latest deals and updates.</p>
          </div>
          <NewsletterForm theme="dark" />
        </div>
      </div>
      <div className="bg-slate-800/50 border-y border-white/5 py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-blue-300 font-semibold mb-2">Have a project in mind?</p>
            <h4 className="font-display text-2xl md:text-3xl">Get a free consultation & detailed quote</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <RequestQuoteModal topic="General Inquiry" buttonLabel="Request a free quote" className="px-6 py-3 rounded-full font-semibold transition" variant="solid" />
            <a href="https://wa.me/233261404904?text=Hello%20Founders%20%26%20Footsteps" target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">F</div>
              <div>
                <h2 className="text-lg font-bold">Founders & Footsteps</h2>
                <p className="text-xs text-white/60">Apex Lifestyle Syndicate</p>
              </div>
            </Link>
            <p className="text-white/60 text-sm mb-6 max-w-sm leading-relaxed">
              The ultimate all-in-one destination. Construction, travel, events, marketplace, logistics, salon, tech — one trusted brand handles it all.
            </p>
            <div className="flex gap-2 mb-6">
              <a href="https://whatsapp.com/channel/0029VbCRKYZ8fewuzp4cvU11" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-sm">WA</a>
              <a href="https://wa.me/233257664762" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-white/70"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>0261404904</span></div>
              <div className="flex items-start gap-3 text-white/70"><MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>WhatsApp: 0257664762 / 0261404904</span></div>
              <div className="flex items-start gap-3 text-white/70"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>phrimpongkelvin@gmail.com</span></div>
              <div className="flex items-start gap-3 text-white/70"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>Accra, Ghana</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/90 mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((s) => <li key={s.href}><Link href={s.href} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 group">{s.name}<ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/90 mb-6">Company</h4>
            <ul className="space-y-3">
              {company.map((c) => <li key={c.name}><Link href={c.href} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 group">{c.name}<ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/90 mb-6">Support</h4>
            <ul className="space-y-3">
              {support.map((s) => <li key={s.name}><Link href={s.href} className="text-white/60 hover:text-white text-sm flex items-center gap-1.5 group">{s.name}<ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} Founders & Footsteps · Apex Lifestyle Syndicate. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {["MTN", "Vodafone", "Visa", "Mastercard", "Mobile Money"].map((p) => <span key={p} className="text-[10px] uppercase tracking-widest text-white/40 px-2 py-1 border border-white/10 rounded">{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
