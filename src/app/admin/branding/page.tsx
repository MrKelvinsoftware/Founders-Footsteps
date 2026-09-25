"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Save, CheckCircle, Image as ImageLucide, Type, Phone, Mail,
  Globe, MessageCircle, MapPin, Palette
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

type BrandingData = {
  logo: string;
  logoMark: string;
  brandName: string;
  tagline: string;
  brandColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialTiktok: string;
  footerText: string;
};

const defaultBranding: BrandingData = {
  logo: "",
  logoMark: "",
  brandName: "Founders & Footsteps",
  tagline: "Apex Lifestyle Syndicate",
  brandColor: "#2563eb",
  phone: "0261404904",
  whatsapp: "0257664762",
  email: "phrimpongkelvin@gmail.com",
  address: "Accra, Ghana",
  socialFacebook: "",
  socialInstagram: "",
  socialTwitter: "",
  socialTiktok: "",
  footerText: "© 2026 Founders & Footsteps. All rights reserved.",
};

export default function AdminBrandingPage() {
  const [data, setData] = useState<BrandingData>(defaultBranding);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/branding")
      .then(r => r.json())
      .then(json => {
        if (json.ok && json.data) setData({ ...defaultBranding, ...json.data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    await fetch("/api/admin/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    // Also store in localStorage for client components
    localStorage.setItem("ff_branding", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500";

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-blue-600 font-semibold">Site Settings</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Branding & Contact</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
            <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold hover:bg-blue-600">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Logo & Brand */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5" /> Brand Identity
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ImageUpload
                value={data.logo}
                onChange={(url) => setData({ ...data, logo: url })}
                label="Full Logo"
                hint="Main logo displayed in navigation. Recommended: 200×50px transparent PNG"
              />
            </div>
            <div>
              <ImageUpload
                value={data.logoMark}
                onChange={(url) => setData({ ...data, logoMark: url })}
                label="Logo Mark / Icon"
                hint="Square icon used in the nav bar and favicon. 100×100px"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                <Type className="w-3.5 h-3.5 inline mr-1" /> Brand Name
              </label>
              <input value={data.brandName} onChange={e => setData({ ...data, brandName: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                Tagline / Slogan
              </label>
              <input value={data.tagline} onChange={e => setData({ ...data, tagline: e.target.value })} className={inp} placeholder="Apex Lifestyle Syndicate" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={data.brandColor} onChange={e => setData({ ...data, brandColor: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200" />
                <input value={data.brandColor} onChange={e => setData({ ...data, brandColor: e.target.value })} className={inp} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3">
              {data.logoMark ? (
                <img src={data.logoMark} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: data.brandColor }}>
                  {data.brandName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900">{data.brandName}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{data.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5" /> Contact Information
          </h2>
          <p className="text-sm text-slate-500">These details appear on the Contact page, Footer, and service pages.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone Number
              </label>
              <input value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className={inp} placeholder="0261404904" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> WhatsApp
              </label>
              <input value={data.whatsapp} onChange={e => setData({ ...data, whatsapp: e.target.value })} className={inp} placeholder="0257664762" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email Address
              </label>
              <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                <MapPin className="w-3.5 h-3.5 inline mr-1" /> Business Address
              </label>
              <input value={data.address} onChange={e => setData({ ...data, address: e.target.value })} className={inp} placeholder="Accra, Ghana" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Social Media Links
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Facebook</label>
              <input value={data.socialFacebook} onChange={e => setData({ ...data, socialFacebook: e.target.value })} className={inp} placeholder="https://facebook.com/…" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Instagram</label>
              <input value={data.socialInstagram} onChange={e => setData({ ...data, socialInstagram: e.target.value })} className={inp} placeholder="https://instagram.com/…" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">Twitter / X</label>
              <input value={data.socialTwitter} onChange={e => setData({ ...data, socialTwitter: e.target.value })} className={inp} placeholder="https://x.com/…" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">TikTok</label>
              <input value={data.socialTiktok} onChange={e => setData({ ...data, socialTiktok: e.target.value })} className={inp} placeholder="https://tiktok.com/@…" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-slate-900">Footer Text</h2>
          <input value={data.footerText} onChange={e => setData({ ...data, footerText: e.target.value })} className={inp} />
        </div>
      </main>
    </div>
  );
}
