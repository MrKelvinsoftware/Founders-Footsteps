"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Save,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  X,
  Pencil,
  HelpCircle,
  Briefcase,
  Newspaper,
  RotateCcw,
  BookOpen,
  Shield,
  Scale,
  Home,
  Car,
  Utensils,
  Scissors,
  Truck,
  Wrench,
} from "lucide-react";

/* ─── Types ─── */
type CmsSection = { heading: string; body: string };
type CmsData = {
  title: string;
  subtitle?: string;
  heroImage?: string;
  sections: CmsSection[];
};
type PageDef = {
  slug: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultData: CmsData;
};

/* ─── Default content for every CMS-managed page ─── */
const pages: PageDef[] = [
  {
    slug: "faq",
    label: "FAQ",
    icon: HelpCircle,
    color: "#2563eb",
    defaultData: {
      title: "Frequently Asked Questions",
      subtitle: "Quick answers about our services, payments, and policies.",
      sections: [
        { heading: "How do I place an order?", body: "Browse the marketplace, add items to cart, then checkout. We support Mobile Money, Visa, Mastercard, and bank transfer." },
        { heading: "Do you deliver outside Accra?", body: "Yes. We deliver to all 16 regions of Ghana. International shipping is available for select heavy machinery and goods." },
        { heading: "What currency do you charge in?", body: "All prices are in Ghana Cedis (GH₵). Your card may convert automatically if you pay in another currency." },
        { heading: "How do I book a service?", body: "Visit the service page (Construction, Catering & Events, Travel, Salon), fill out the form with your requirements, and our team will follow up with a detailed quote." },
        { heading: "Can I cancel an order?", body: "Yes, before fulfilment. Construction & event bookings have a 50% cancellation fee within 7 days of the scheduled date." },
        { heading: "Do you offer trade accounts?", body: "Yes. We have trade accounts for construction companies, event planners, and corporate clients with preferential pricing. Contact phrimpongkelvin@gmail.com." },
        { heading: "How do I become a vendor?", body: "Apply through our vendor portal or email phrimpongkelvin@gmail.com. We vet all vendors for quality and reliability." },
        { heading: "Is the construction service insured?", body: "Yes, all our construction projects carry full contractor insurance and we provide a 10-year structural warranty." },
      ],
    },
  },
  {
    slug: "careers",
    label: "Careers",
    icon: Briefcase,
    color: "#059669",
    defaultData: {
      title: "Careers at Founders & Footsteps",
      subtitle: "We're building the most ambitious multi-service platform in West Africa. Come shape the future with us.",
      heroImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
      sections: [
        { heading: "Senior Construction Engineer", body: "Department: Construction\nLocation: Accra\nType: Full-time\n\nWe're looking for an experienced construction engineer to lead residential and commercial projects across Ghana." },
        { heading: "Travel Operations Lead", body: "Department: Travel & Trips\nLocation: Accra · Hybrid\nType: Full-time\n\nManage trip logistics, vendor relationships, and customer experience for our growing travel desk." },
        { heading: "Frontend Engineer (Next.js)", body: "Department: Engineering\nLocation: Remote · Ghana\nType: Full-time\n\nBuild and maintain our customer-facing platform using Next.js, Tailwind CSS, and PostgreSQL." },
        { heading: "Logistics Coordinator", body: "Department: Logistics\nLocation: Tema\nType: Full-time\n\nCoordinate domestic and international shipments, manage warehouse operations." },
        { heading: "Catering Event Manager", body: "Department: Events\nLocation: Accra\nType: Contract\n\nPlan and execute weddings, corporate events, and private parties." },
        { heading: "Customer Experience Associate", body: "Department: Operations\nLocation: Kumasi\nType: Full-time\n\nProvide world-class support to customers across all service lines." },
      ],
    },
  },
  {
    slug: "press",
    label: "Press & News",
    icon: Newspaper,
    color: "#7c3aed",
    defaultData: {
      title: "Press & News",
      subtitle: "The latest from Founders & Footsteps.",
      sections: [
        { heading: "Founders & Footsteps Launches 8-Service Platform", body: "Accra, Ghana — Founders & Footsteps, a new multi-service digital platform, officially launches today offering Construction, Car Rental, Catering & Events, Travel & Trips, Salon & Beauty, Logistics, Tech Repairs, and an online Marketplace — all under one roof.\n\nFor press inquiries, email phrimpongkelvin@gmail.com." },
        { heading: "Media Kit", body: "Download our brand assets, logos, and press materials by contacting phrimpongkelvin@gmail.com." },
      ],
    },
  },
  {
    slug: "returns",
    label: "Returns & Refunds",
    icon: RotateCcw,
    color: "#d97706",
    defaultData: {
      title: "Returns & Refunds Policy",
      subtitle: "Your satisfaction is our priority.",
      sections: [
        { heading: "Return Window", body: "You may return most marketplace items within 7 days of delivery for a full refund, provided they are unused and in original packaging." },
        { heading: "Non-Returnable Items", body: "Perishable goods, customised items, and sealed beauty/hygiene products that have been opened are not eligible for return." },
        { heading: "How to Initiate a Return", body: "Contact us at phrimpongkelvin@gmail.com or call 0261404904 with your order number. We'll arrange free pickup in Accra and Kumasi." },
        { heading: "Refund Timeline", body: "Once we receive and inspect your return, refunds are processed within 3-5 business days to your original payment method." },
        { heading: "Service Bookings", body: "Construction and event bookings may be cancelled up to 7 days before the scheduled date. A 50% cancellation fee applies for late cancellations." },
      ],
    },
  },
  {
    slug: "help",
    label: "Help Centre",
    icon: BookOpen,
    color: "#0891b2",
    defaultData: {
      title: "Help Centre",
      subtitle: "How can we help you today?",
      sections: [
        { heading: "Getting Started", body: "Create a free account to access all services. Browse our marketplace, book services, or request quotes — everything is accessible from the homepage." },
        { heading: "Placing an Order", body: "Add items to your cart, proceed to checkout, and pay via Mobile Money, Visa, Mastercard, or bank transfer. Orders are confirmed instantly." },
        { heading: "Booking a Service", body: "Visit any service page (Construction, Events, Travel, Salon, etc.), fill out the request form, and our team will follow up within 24 hours with a detailed quote." },
        { heading: "Tracking Your Order", body: "You'll receive email confirmations with tracking details. For real-time updates, contact us via WhatsApp at 0257664762 or 0261404904." },
        { heading: "Payment Issues", body: "If your payment fails, try again or contact us at phrimpongkelvin@gmail.com. We support MTN MoMo, Vodafone Cash, Visa, and Mastercard." },
        { heading: "Contact Support", body: "Phone: 0261404904\nWhatsApp: 0257664762 / 0261404904\nEmail: phrimpongkelvin@gmail.com\n\nBusiness Hours: Mon-Sat 9am-8pm, Sunday 10am-6pm" },
      ],
    },
  },
  {
    slug: "privacy",
    label: "Privacy Policy",
    icon: Shield,
    color: "#c026d3",
    defaultData: {
      title: "Privacy Policy",
      subtitle: "Last updated: January 2026",
      sections: [
        { heading: "1. Information We Collect", body: "We collect information you give us directly: name, email, phone number, delivery address, payment information (processed by certified gateways — we never store your card), and any information you provide when requesting a service quote." },
        { heading: "2. How We Use It", body: "To deliver services, process payments, send you order updates, improve our platform, and — only with your consent — share relevant offers." },
        { heading: "3. Sharing", body: "We share data only with the partners needed to fulfil your order (couriers, technicians, payment processors). We never sell your personal data." },
        { heading: "4. Your Rights", body: "You can request access, correction, or deletion of your data at any time by emailing phrimpongkelvin@gmail.com. We respond within 30 days." },
        { heading: "5. Contact", body: "For any privacy concerns, email phrimpongkelvin@gmail.com." },
      ],
    },
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    icon: Scale,
    color: "#64748b",
    defaultData: {
      title: "Terms & Conditions",
      subtitle: "Last updated: January 2026",
      sections: [
        { heading: "1. Acceptance of Terms", body: "By accessing or using the Founders & Footsteps platform, you agree to be bound by these Terms of Service." },
        { heading: "2. Services", body: "We provide an online platform connecting customers with Construction, Car Rental, Catering & Events, Travel & Trips, Salon & Beauty, Logistics, Tech Repairs, and Marketplace services." },
        { heading: "3. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating an account." },
        { heading: "4. Payments", body: "All prices are in Ghana Cedis (GH₵). Payments are processed through Paystack. We do not store credit card information." },
        { heading: "5. Cancellations", body: "Marketplace orders may be cancelled before dispatch. Service bookings are subject to the cancellation policy of each service line." },
        { heading: "6. Limitation of Liability", body: "Founders & Footsteps shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services." },
        { heading: "7. Contact", body: "For questions about these terms, contact phrimpongkelvin@gmail.com or call 0261404904." },
      ],
    },
  },
  {
    slug: "construction-info",
    label: "Construction Page",
    icon: Home,
    color: "#64748b",
    defaultData: {
      title: "Construction & Real Estate",
      subtitle: "Expert home building & renovation services — from new construction to remodeling.",
      heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80",
      sections: [
        { heading: "What We Offer", body: "New home construction, kitchen & bathroom renovation, full home remodeling, roofing & extensions. All projects carry full contractor insurance and a 10-year structural warranty." },
        { heading: "Our Process", body: "1. Free consultation & site inspection\n2. Detailed quotation within 48 hours\n3. 60% deposit to commence work\n4. Regular progress updates\n5. Final walkthrough & handover" },
        { heading: "Quality Tiers", body: "Standard / Economy — local materials, basic finishes\nMid-Market / Modern — POP ceilings, porcelain tiles, fitted kitchen\nPremium / Luxury — imported finishes, smart home tech, luxury furniture" },
      ],
    },
  },
  {
    slug: "car-rental-info",
    label: "Car Rental Page",
    icon: Car,
    color: "#2563eb",
    defaultData: {
      title: "Car Services",
      subtitle: "Premium vehicles for every occasion — from economy cars to luxury SUVs.",
      sections: [
        { heading: "Fleet Overview", body: "Economy hatchbacks, compact sedans, luxury SUVs, passenger vans — clean, well-maintained vehicles delivered to your door or pick up from any major city in Ghana." },
        { heading: "Rental Terms", body: "Daily & weekly rates available\nFree cancellation up to 24 hours before\nUnlimited mileage on all rentals\n24/7 roadside assistance included\nGPS & child seats available on request" },
      ],
    },
  },
  {
    slug: "catering-events-info",
    label: "Catering & Events Page",
    icon: Utensils,
    color: "#d97706",
    defaultData: {
      title: "Catering & Events",
      subtitle: "Unforgettable celebrations with premium catering and full event planning.",
      sections: [
        { heading: "Event Types", body: "Weddings · Corporate events · Birthday parties · Funerals · Engagements · Private dinners" },
        { heading: "What's Included", body: "Base package from GH₵45,000 covers venue setup, professional staff, and standard buffet for 80–95 guests. Menu customisation, drinks, DJ, photography, and decor available as add-ons with live pricing." },
        { heading: "Booking Process", body: "70% deposit secures your date. Balance due 7 days before the event. Final figure confirmed after tasting." },
      ],
    },
  },
  {
    slug: "salon-beauty-info",
    label: "Salon & Beauty Page",
    icon: Scissors,
    color: "#c026d3",
    defaultData: {
      title: "Salon & Beauty",
      subtitle: "Premium salon services to help you look and feel your best.",
      sections: [
        { heading: "Services", body: "Haircut & Style · Hair Coloring · Braids · Weave/Wig Install · Facial Treatment · Manicure · Pedicure · Full Body Massage · Bridal Package · Professional Makeup · Spa Package · Nail Art" },
        { heading: "Booking", body: "Live calendar availability · Mon–Sun · 9am–6pm\nPay online to lock your slot, or pay at the salon.\nArrival: 10 minutes before your appointment." },
      ],
    },
  },
  {
    slug: "logistics-info",
    label: "Logistics Page",
    icon: Truck,
    color: "#059669",
    defaultData: {
      title: "Global Logistics",
      subtitle: "Domestic and international freight, warehousing, and last-mile delivery.",
      sections: [
        { heading: "Services", body: "Domestic Delivery (same-day & next-day across all 16 regions)\nInternational Shipping (air & sea freight)\nWarehousing (Accra, Tema, Kumasi)\nCargo Insurance (full-value coverage)\nExpress Air Cargo\nSea Freight (FCL & LCL)" },
        { heading: "Coverage", body: "Domestic: All 16 regions of Ghana\nInternational: 200+ destinations worldwide\nReal-time tracking on every shipment" },
      ],
    },
  },
  {
    slug: "tech-repairs-info",
    label: "Tech Repairs Page",
    icon: Wrench,
    color: "#7c3aed",
    defaultData: {
      title: "Tech Repairs",
      subtitle: "Expert repair services for all your devices and electronics.",
      sections: [
        { heading: "Devices We Repair", body: "Phones (Apple, Samsung, Tecno, Infinix, Xiaomi, Google, and more)\nTablets & iPads\nLaptops & MacBooks\nTVs & Displays\nCameras\nHeadphones & Audio equipment" },
        { heading: "Warranty & Pricing", body: "90-day repair warranty on all jobs\nGenuine OEM parts\nSame-day diagnosis\nFree pickup & delivery in Accra & Kumasi (GH₵50 fee)\nReal-time quotes based on brand, model, and repair type" },
      ],
    },
  },
];

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500";

function AdminContentInner() {
  const searchParams = useSearchParams();
  const autoSlug = searchParams.get("slug");
  const [activePage, setActivePage] = useState<PageDef | null>(null);
  const [form, setForm] = useState<CmsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [autoOpened, setAutoOpened] = useState(false);

  /* On mount, check which pages have been customised */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cms");
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          const map: Record<string, boolean> = {};
          for (const row of json.data) {
            map[row.slug] = true;
          }
          setSavedMap(map);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  /* Auto-open a page when navigated from /admin/services?slug=... */
  useEffect(() => {
    if (autoSlug && !autoOpened) {
      const match = pages.find((p) => p.slug === autoSlug);
      if (match) {
        setAutoOpened(true);
        openEditor(match);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlug, autoOpened]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };

  const openEditor = async (page: PageDef) => {
    setActivePage(page);
    // Try loading saved content from DB
    try {
      const res = await fetch(`/api/cms?slug=${encodeURIComponent(page.slug)}`);
      const json = await res.json();
      if (json.ok && json.data && json.data.content) {
        const c = json.data.content as CmsData;
        if (c.title && c.sections) {
          setForm(c);
          return;
        }
      }
    } catch {
      /* fallback */
    }
    // Use default
    setForm(JSON.parse(JSON.stringify(page.defaultData)));
  };

  const save = async () => {
    if (!activePage || !form) return;
    setSaving(true);
    try {
      await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: activePage.slug,
          title: form.title,
          content: form,
        }),
      });
      setSavedMap((m) => ({ ...m, [activePage.slug]: true }));
      flash("Published successfully!");
    } catch {
      flash("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (!activePage) return;
    setForm(JSON.parse(JSON.stringify(activePage.defaultData)));
    flash("Reset to defaults — save to apply.");
  };

  const updateSection = (i: number, field: "heading" | "body", value: string) => {
    if (!form) return;
    const sections = [...form.sections];
    sections[i] = { ...sections[i], [field]: value };
    setForm({ ...form, sections });
  };

  const addSection = () => {
    if (!form) return;
    setForm({
      ...form,
      sections: [...form.sections, { heading: "New Section", body: "" }],
    });
  };

  const removeSection = (i: number) => {
    if (!form) return;
    setForm({
      ...form,
      sections: form.sections.filter((_, j) => j !== i),
    });
  };

  /* ─── Page list view ─── */
  if (!activePage || !form) {
    return (
      <div className="min-h-screen bg-[#fafaf7]">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3 px-6 py-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-blue-600 font-semibold">
                Site-wide
              </p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">
                Content Management
              </h1>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-5xl mx-auto">
          <p className="text-slate-500 mb-6">
            Edit and update every informational page on the site without writing
            code. Changes go live immediately after saving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page) => {
              const Icon = page.icon;
              const customised = savedMap[page.slug];
              return (
                <button
                  key={page.slug}
                  onClick={() => openEditor(page)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${page.color}15`,
                        color: page.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition" />
                  </div>
                  <h3 className="font-display text-lg text-slate-900 mb-1">
                    {page.label}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {page.defaultData.sections.length} section
                    {page.defaultData.sections.length !== 1 ? "s" : ""}
                  </p>
                  {customised && (
                    <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-emerald-600 font-semibold">
                      ✓ Customised
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  /* ─── Editor view ─── */
  const Icon = activePage.icon;
  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActivePage(null);
                setForm(null);
              }}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `${activePage.color}15`,
                color: activePage.color,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p
                className="text-[10px] uppercase tracking-[0.28em] font-semibold"
                style={{ color: activePage.color }}
              >
                Editing
              </p>
              <h1 className="font-display text-xl text-slate-900 leading-none">
                {activePage.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Page meta */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Page Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                Page Title
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                Subtitle
              </label>
              <input
                value={form.subtitle || ""}
                onChange={(e) =>
                  setForm({ ...form, subtitle: e.target.value })
                }
                className={inp}
                placeholder="Optional subtitle"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1.5">
                Hero Image URL (optional)
              </label>
              <input
                value={form.heroImage || ""}
                onChange={(e) =>
                  setForm({ ...form, heroImage: e.target.value })
                }
                className={inp}
                placeholder="https://images.unsplash.com/…"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Sections (
              {form.sections.length})
            </h2>
            <button
              onClick={addSection}
              className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add section
            </button>
          </div>

          {form.sections.map((sec, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Section {i + 1}
                </span>
                <button
                  onClick={() => removeSection(i)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1">
                  Heading
                </label>
                <input
                  value={sec.heading}
                  onChange={(e) =>
                    updateSection(i, "heading", e.target.value)
                  }
                  className={inp}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-1">
                  Body
                </label>
                <textarea
                  value={sec.body}
                  onChange={(e) =>
                    updateSection(i, "body", e.target.value)
                  }
                  rows={5}
                  className={`${inp} resize-none`}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-slate-900 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[rise_.3s_ease]">
          <Check className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      <style jsx global>{`
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500 animate-pulse">Loading…</p></div>}>
      <AdminContentInner />
    </Suspense>
  );
}
