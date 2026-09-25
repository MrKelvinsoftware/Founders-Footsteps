"use client";

import { useState, useEffect } from "react";
import { Palette, CheckCircle, ArrowRight, Star, Sparkles, PenTool, Image, Layers, FileText, Mail, Phone, User, MessageSquare, Shield } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { pay } from "@/lib/payments";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";

type DesignService = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "branding" | "print" | "digital" | "packaging";
  deliverables: string[];
  turnaround: string;
};

const STORAGE_KEY = "ff_admin_pricing";

const defaultServices: DesignService[] = [
  // Branding
  { id: "gd-1", name: "Logo Design (Basic)", price: 500, category: "branding", description: "2 initial concepts with 2 rounds of revisions", deliverables: ["PNG, JPG, SVG files", "Black & white versions", "Brand color codes"], turnaround: "5-7 days" },
  { id: "gd-2", name: "Logo Design (Premium)", price: 1500, category: "branding", description: "5 initial concepts with unlimited revisions", deliverables: ["All file formats", "Brand guidelines", "Social media kit", "Stationery mockups"], turnaround: "10-14 days" },
  { id: "gd-12", name: "Brand Identity Package", price: 3500, category: "branding", description: "Complete brand identity from scratch", deliverables: ["Logo design", "Color palette", "Typography", "Brand guidelines PDF", "Business card", "Letterhead"], turnaround: "3-4 weeks" },

  // Print
  { id: "gd-3", name: "Business Card Design", price: 200, category: "print", description: "Professional double-sided business card", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "2-3 days" },
  { id: "gd-4", name: "Letterhead Design", price: 150, category: "print", description: "Corporate letterhead template", deliverables: ["Print-ready PDF", "Word template", "Source files"], turnaround: "2-3 days" },
  { id: "gd-5", name: "Brochure Design (Tri-fold)", price: 400, category: "print", description: "6-panel tri-fold brochure", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "4-5 days" },
  { id: "gd-6", name: "Flyer Design", price: 250, category: "print", description: "Single-page promotional flyer", deliverables: ["Print-ready PDF", "Web version", "Source files"], turnaround: "2-3 days" },
  { id: "gd-7", name: "Poster Design", price: 350, category: "print", description: "Large format poster design", deliverables: ["Print-ready PDF", "Multiple sizes", "Source files"], turnaround: "3-4 days" },
  { id: "gd-14", name: "Menu Design", price: 600, category: "print", description: "Restaurant menu layout", deliverables: ["Print-ready PDF", "Editable template", "2 revisions"], turnaround: "5-7 days" },
  { id: "gd-16", name: "Invitation Design", price: 300, category: "print", description: "Event invitations", deliverables: ["Print-ready PDF", "Digital version", "RSVP card"], turnaround: "3-4 days" },

  // Digital
  { id: "gd-8", name: "Social Media Kit", price: 800, category: "digital", description: "10 customizable post templates", deliverables: ["Instagram, Facebook, LinkedIn", "Story templates", "Canva templates"], turnaround: "5-7 days" },
  { id: "gd-9", name: "Social Media Post", price: 100, category: "digital", description: "Single social media post design", deliverables: ["Optimized for platform", "Caption suggestions", "Hashtag research"], turnaround: "1-2 days" },
  { id: "gd-10", name: "Web Banner Design", price: 200, category: "digital", description: "Website banner/header image", deliverables: ["Multiple sizes", "Optimized for web", "Source files"], turnaround: "2-3 days" },
  { id: "gd-18", name: "Infographic Design", price: 500, category: "digital", description: "Data visualization infographic", deliverables: ["High-res PNG/PDF", "Editable source", "2 revisions"], turnaround: "4-5 days" },
  { id: "gd-15", name: "Book Cover Design", price: 800, category: "digital", description: "Front cover and spine design", deliverables: ["Print-ready PDF", "eBook cover", "3D mockup"], turnaround: "5-7 days" },

  // Packaging
  { id: "gd-13", name: "Packaging Design", price: 1200, category: "packaging", description: "Product packaging design", deliverables: ["Dieline template", "3D mockups", "Print-ready files"], turnaround: "7-10 days" },
  { id: "gd-11", name: "Print Banner Design", price: 300, category: "packaging", description: "Roll-up/outdoor banner", deliverables: ["Print-ready PDF", "Source files", "2 revisions"], turnaround: "3-4 days" },
  { id: "gd-17", name: "T-Shirt Design", price: 250, category: "packaging", description: "Custom apparel graphics", deliverables: ["Print-ready files", "Mockup images", "Color separations"], turnaround: "3-4 days" },
];

const categories = [
  { id: "branding", name: "Branding & Identity", icon: Sparkles },
  { id: "print", name: "Print Design", icon: FileText },
  { id: "digital", name: "Digital Design", icon: Layers },
  { id: "packaging", name: "Packaging & Merch", icon: PenTool },
];

export default function GraphicDesignPage() {
  const [services, setServices] = useState<DesignService[]>(defaultServices);
  const [selectedCategory, setSelectedCategory] = useState<string>("branding");
  const [cart, setCart] = useState<{ service: DesignService; quantity: number }[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", projectDetails: "" });
  const [done, setDone] = useState(false);
  const [payOption, setPayOption] = useState<"full" | "deposit">("full");

  // Load prices from admin settings
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const adminPrices = parsed["graphic-design"] || [];
        if (adminPrices.length > 0) {
          const priceMap = new Map(adminPrices.map((p: { id: string; price: number }) => [p.id, p.price]));
          setServices(defaultServices.map(s => ({
            ...s,
            price: priceMap.has(s.id) ? (priceMap.get(s.id) as number) : s.price,
          })));
        }
      } catch (e) {
        console.error("Failed to load admin prices:", e);
      }
    }
  }, []);

  const filteredServices = services.filter(s => s.category === selectedCategory);
  const subtotal = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const total = subtotal;

  const addToCart = (service: DesignService) => {
    setCart(prev => {
      const existing = prev.find(item => item.service.id === service.id);
      if (existing) {
        return prev.map(item =>
          item.service.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { service, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.service.id === serviceId ? { ...item, quantity } : item
    ));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const payAmount = payOption === "deposit" ? Math.ceil(total * 0.5) : total;
    pay({
      amountGHS: payAmount,
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      onSuccess: async (reference) => {
        const servicesOrdered = cart.map(item => `${item.service.name} x${item.quantity}`).join(", ");
        await addSubmission({
          type: "graphic-design",
          total,
          currency: "GHS",
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
          summary: servicesOrdered,
          payload: { 
            services: cart.map(item => ({ 
              id: item.service.id, 
              name: item.service.name, 
              price: item.service.price, 
              quantity: item.quantity,
              deliverables: item.service.deliverables,
              turnaround: item.service.turnaround,
            })),
            projectDetails: form.projectDetails,
            paymentOption: payOption,
            reference,
          },
        });
        setDone(true);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-orange-100 font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-[1px] bg-orange-200" /> Creative Studio
          </p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] mb-5 max-w-4xl">
            Designs that tell your story and grow your brand.
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            From logo design to complete brand identities, social media graphics to packaging — our creative team delivers designs that stand out.
          </p>
        </div>
      </section>

      <ServiceInfoBanner slug="graphic-design" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content */}
          <div>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                      isActive 
                        ? "bg-orange-600 text-white shadow-lg" 
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredServices.map((service, i) => {
                const inCart = cart.find(item => item.service.id === service.id);
                return (
                  <div 
                    key={service.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all animate-rise"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-slate-900">{service.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-display text-xl text-orange-600">GH₵{service.price.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{service.turnaround}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Deliverables</p>
                      <div className="flex flex-wrap gap-1.5">
                        {service.deliverables.slice(0, 3).map((d, j) => (
                          <span key={j} className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
                            {d}
                          </span>
                        ))}
                        {service.deliverables.length > 3 && (
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
                            +{service.deliverables.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(service.id, inCart.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(service.id, inCart.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(service.id)}
                          className="ml-auto text-sm text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(service)}
                        className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
                      >
                        Add to Quote
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Portfolio Preview */}
            <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-8">
              <h3 className="font-display text-2xl text-slate-900 mb-4">Why Choose Our Design Studio?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Star, title: "Expert Designers", desc: "Experienced professionals with diverse industry expertise" },
                  { icon: Shield, title: "100% Original", desc: "All designs are custom-made and include full rights" },
                  { icon: CheckCircle, title: "Fast Turnaround", desc: "Quick delivery without compromising quality" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Palette className="w-5 h-5" />
                  <h3 className="font-display text-lg">Your Quote</h3>
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Add services to your quote</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.service.id} className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{item.service.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          GH₵{(item.service.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between font-display text-lg">
                        <span>Total</span>
                        <span className="text-orange-600">GH₵{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => cart.length > 0 && setShowCheckout(true)}
                  disabled={cart.length === 0}
                  className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Drawer */}
      {showCheckout && !done && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-[slideInRight_.3s_ease]">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-orange-600 font-semibold">Checkout</p>
                <h2 className="font-display text-xl text-slate-900 leading-none mt-1">Complete Your Order</h2>
              </div>
              <button onClick={() => setShowCheckout(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">✕</button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">
                  <User className="w-3.5 h-3.5 inline mr-1" /> Contact Information
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
                  <input required placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">
                  <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
                </label>
                <input required type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">
                  <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone
                </label>
                <input required type="tel" placeholder="+233..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">
                  <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Project Details
                </label>
                <textarea 
                  placeholder="Tell us about your project, brand, and any specific requirements..." 
                  value={form.projectDetails} 
                  onChange={(e) => setForm({ ...form, projectDetails: e.target.value })} 
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 block mb-2">Payment Option</label>
                <div className="space-y-2">
                  {[
                    { id: "full", label: "Pay in Full", desc: "Pay the full amount now" },
                    { id: "deposit", label: "50% Deposit", desc: "Pay 50% now, balance on delivery" },
                  ].map((opt) => (
                    <label key={opt.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${payOption === opt.id ? "border-orange-500 bg-orange-50" : "border-slate-200"}`}>
                      <span className="flex items-center gap-2">
                        <input type="radio" name="payOption" checked={payOption === opt.id} onChange={() => setPayOption(opt.id as "full" | "deposit")} className="accent-orange-600" />
                        <span>
                          <span className="font-medium text-slate-900 block">{opt.label}</span>
                          <span className="text-xs text-slate-500">{opt.desc}</span>
                        </span>
                      </span>
                      <span className="font-semibold text-orange-600">
                        GH₵{(opt.id === "full" ? total : Math.ceil(total * 0.5)).toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.service.id} className="flex justify-between text-slate-600">
                    <span>{item.service.name} × {item.quantity}</span>
                    <span>GH₵{(item.service.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-display text-lg text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>GH₵{total.toLocaleString()}</span>
                </div>
                {payOption === "deposit" && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Due now (50%)</span>
                    <span>GH₵{Math.ceil(total * 0.5).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-3.5 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 flex items-center justify-center gap-2">
                Pay & Submit <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Design Request Submitted!</h3>
            <p className="text-slate-600 mb-2">{cart.length} service{cart.length > 1 ? "s" : ""} ordered</p>
            <p className="font-display text-3xl text-orange-600 mb-6">GH₵{total.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mb-5">Our design team will reach out within 24 hours to discuss your project.</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <NotifyStatus email={form.email} phone={form.phone} />
            </div>
            <button onClick={() => { setDone(false); setShowCheckout(false); setCart([]); }} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Done</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-rise { animation: rise 0.5s ease forwards; opacity: 0; }
      `}</style>
    </div>
  );
}
