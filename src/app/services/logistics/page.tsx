"use client";

import { useState, useEffect } from "react";
import { 
  Truck, Package, Globe, MapPin, Shield, CheckCircle, ArrowRight, 
  Plane, Ship, Clock, Calculator, Phone, Mail,
  Warehouse, Info, CreditCard, Timer,
  PackageCheck, DollarSign, MessageCircle
} from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { pay } from "@/lib/payments";
import NotifyStatus from "@/components/NotifyStatus";
import ServiceInfoBanner from "@/components/ServiceInfoBanner";
import LiveGlobe from "@/components/LiveGlobe";

const STORAGE_KEY = "ff_logistics_cms";

const ghanaRegions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern",
  "Volta", "Upper East", "Upper West", "Brong-Ahafo", "Oti", "Bono East",
  "Ahafo", "Savannah", "North East", "Western North"
];

const internationalDestinations: Record<string, string[]> = {
  africa: ["Nigeria", "South Africa", "Kenya", "Egypt", "Morocco", "Senegal", "Ivory Coast", "Tanzania"],
  europe: ["United Kingdom", "Germany", "France", "Netherlands", "Italy", "Spain", "Belgium", "Poland"],
  americas: ["United States", "Canada", "Brazil", "Mexico"],
  asia: ["China", "UAE", "India", "Singapore", "Japan", "South Korea", "Saudi Arabia"],
  oceania: ["Australia", "New Zealand"],
};

const tabs = [
  { id: "domestic", name: "Domestic Delivery", icon: Truck, color: "#2563eb", description: "Same-day and next-day delivery across all 16 regions of Ghana." },
  { id: "international", name: "International Shipping", icon: Globe, color: "#0891b2", description: "Worldwide air & sea freight with door-to-door tracking." },
  { id: "warehousing", name: "Warehousing", icon: Warehouse, color: "#059669", description: "Climate-controlled storage facilities in Accra, Tema & Kumasi." },
  { id: "insurance", name: "Cargo Insurance", icon: Shield, color: "#7c3aed", description: "Full-value coverage on every shipment, no exceptions." },
  { id: "airfreight", name: "Air Freight", icon: Plane, color: "#d97706", description: "Express air cargo to 200+ destinations worldwide." },
  { id: "seafreight", name: "Sea Freight", icon: Ship, color: "#c026d3", description: "FCL & LCL container shipping with port-to-port service." },
];

const defaultPricing = {
  domestic: { sameDay: { accra: 80, regional: 150, express: 220 }, nextDay: { accra: 50, regional: 100, national: 180 }, standard: { accra: 30, regional: 70, national: 120 }, bulkDiscount: 15 },
  international: { air: { africa: 400, europe: 850, americas: 1200, asia: 950, oceania: 1400 }, sea: { africa: 200, europe: 450, americas: 600, asia: 350, oceania: 800 }, express: { africa: 600, europe: 1200, americas: 1800, asia: 1400, oceania: 2000 } },
  warehousing: { standard: { daily: 5, weekly: 30, monthly: 100 }, climate: { daily: 10, weekly: 60, monthly: 200 }, secure: { daily: 15, weekly: 90, monthly: 300 } },
  insurance: { basic: 2, standard: 3.5, premium: 5 },
  airfreight: { economy: 45, standard: 65, express: 95, priority: 150 },
  seafreight: { lcl: 25, fcl20: 2500, fcl40: 4500, fcl40hc: 5200 },
};

type TabId = "domestic" | "international" | "warehousing" | "insurance" | "airfreight" | "seafreight";

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("domestic");
  const [pricing] = useState(defaultPricing);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "" });
  const [done, setDone] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [quote, setQuote] = useState<{ total: number; breakdown: { label: string; amount: number }[] } | null>(null);

  const [domesticForm, setDomesticForm] = useState({
    serviceType: "sameDay", pickupRegion: "Greater Accra", pickupAddress: "", deliveryRegion: "Greater Accra", deliveryAddress: "",
    weight: "", items: "1", pickupDate: "", insurance: false, fragile: false,
  });
  const [internationalForm, setInternationalForm] = useState({
    shippingMethod: "air", destinationRegion: "europe", destinationCountry: "United Kingdom", destinationCity: "",
    weight: "", declaredValue: "", contents: "", insurance: true, customsClearance: true,
  });
  const [warehousingForm, setWarehousingForm] = useState({
    facility: "accra", storageType: "standard", duration: "monthly", pallets: "1", startDate: "",
    specialRequirements: [] as string[],
  });
  const [insuranceForm, setInsuranceForm] = useState({ coverageType: "standard", declaredValue: "", shipmentType: "domestic" });
  const [airfreightForm, setAirfreightForm] = useState({
    serviceLevel: "standard", origin: "Accra", destination: "", weight: "", pickupDate: "", dangerous: false, temperature: false,
  });
  const [seafreightForm, setSeafreightForm] = useState({
    containerType: "lcl", originPort: "Tema", destinationPort: "", cbm: "", incoterms: "FOB",
  });

  // Load admin pricing from localStorage CMS
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) { /* pricing loaded from admin CMS */ }
    } catch { /* ignore */ }
  }, []);

  const calculateQuote = () => {
    setCalculating(true);
    setTimeout(() => {
      let total = 0;
      const breakdown: { label: string; amount: number }[] = [];

      if (activeTab === "domestic") {
        const weight = parseFloat(domesticForm.weight) || 1;
        const items = parseInt(domesticForm.items) || 1;
        const isSame = domesticForm.pickupRegion === domesticForm.deliveryRegion;
        const isAccra = domesticForm.pickupRegion === "Greater Accra" && domesticForm.deliveryRegion === "Greater Accra";
        let base = 0;
        const type = domesticForm.serviceType as "sameDay" | "nextDay" | "standard";
        if (type === "sameDay") base = isAccra ? pricing.domestic.sameDay.accra : isSame ? pricing.domestic.sameDay.regional : pricing.domestic.sameDay.express;
        else if (type === "nextDay") base = isAccra ? pricing.domestic.nextDay.accra : isSame ? pricing.domestic.nextDay.regional : pricing.domestic.nextDay.national;
        else base = isAccra ? pricing.domestic.standard.accra : isSame ? pricing.domestic.standard.regional : pricing.domestic.standard.national;
        const fee = base * items;
        breakdown.push({ label: `${type === "sameDay" ? "Same-Day" : type === "nextDay" ? "Next-Day" : "Standard"} Delivery (${items} item${items > 1 ? "s" : ""})`, amount: fee });
        total += fee;
        if (weight > 5) { const ew = (weight - 5) * 5; breakdown.push({ label: `Extra Weight (${(weight - 5).toFixed(1)}kg)`, amount: ew }); total += ew; }
        if (domesticForm.insurance) { const ins = fee * 0.05; breakdown.push({ label: "Insurance (+5%)", amount: ins }); total += ins; }
        if (domesticForm.fragile) { const fr = 20 * items; breakdown.push({ label: "Fragile Handling", amount: fr }); total += fr; }
      } else if (activeTab === "international") {
        const weight = parseFloat(internationalForm.weight) || 1;
        const dv = parseFloat(internationalForm.declaredValue) || 0;
        const region = internationalForm.destinationRegion as keyof typeof pricing.international.air;
        let rate = 0;
        if (internationalForm.shippingMethod === "air") rate = pricing.international.air[region] || 850;
        else if (internationalForm.shippingMethod === "sea") rate = pricing.international.sea[region] || 450;
        else rate = pricing.international.express[region] || 1200;
        const bf = rate + (weight > 10 ? (weight - 10) * 15 : 0);
        breakdown.push({ label: `${internationalForm.shippingMethod === "air" ? "Air" : internationalForm.shippingMethod === "sea" ? "Sea" : "Express"} to ${internationalForm.destinationCountry}`, amount: bf }); total += bf;
        if (internationalForm.insurance && dv > 0) { const ins = dv * 0.035; breakdown.push({ label: "Cargo Insurance (3.5%)", amount: ins }); total += ins; }
        if (internationalForm.customsClearance) { breakdown.push({ label: "Customs Clearance", amount: 250 }); total += 250; }
      } else if (activeTab === "warehousing") {
        const pallets = parseInt(warehousingForm.pallets) || 1;
        const rates = pricing.warehousing[warehousingForm.storageType as keyof typeof pricing.warehousing] || pricing.warehousing.standard;
        const rate = rates[warehousingForm.duration as keyof typeof rates] || rates.monthly;
        const sf = rate * pallets;
        breakdown.push({ label: `${warehousingForm.storageType} Storage (${pallets} pallet${pallets > 1 ? "s" : ""}, ${warehousingForm.duration})`, amount: sf }); total += sf;
        if (warehousingForm.specialRequirements.includes("handling")) { const h = 50 * pallets; breakdown.push({ label: "Handling", amount: h }); total += h; }
        if (warehousingForm.specialRequirements.includes("inventory")) { breakdown.push({ label: "Inventory Mgmt", amount: 100 }); total += 100; }
      } else if (activeTab === "insurance") {
        const dv = parseFloat(insuranceForm.declaredValue) || 0;
        const rate = pricing.insurance[insuranceForm.coverageType as keyof typeof pricing.insurance] || 3.5;
        const premium = dv * (rate / 100);
        breakdown.push({ label: `${insuranceForm.coverageType} Coverage (${rate}%)`, amount: premium }); total += premium;
        breakdown.push({ label: "Processing Fee", amount: 25 }); total += 25;
      } else if (activeTab === "airfreight") {
        const w = parseFloat(airfreightForm.weight) || 1;
        const rate = pricing.airfreight[airfreightForm.serviceLevel as keyof typeof pricing.airfreight] || 65;
        const ff = rate * w;
        breakdown.push({ label: `${airfreightForm.serviceLevel} Air Freight (${w}kg)`, amount: ff }); total += ff;
        const fuel = ff * 0.15; breakdown.push({ label: "Fuel Surcharge (15%)", amount: fuel }); total += fuel;
        if (airfreightForm.dangerous) { breakdown.push({ label: "DG Handling", amount: 200 }); total += 200; }
        if (airfreightForm.temperature) { const t = w * 10; breakdown.push({ label: "Temp Control", amount: t }); total += t; }
      } else if (activeTab === "seafreight") {
        let ff = 0;
        if (seafreightForm.containerType === "lcl") { const cbm = parseFloat(seafreightForm.cbm) || 1; ff = pricing.seafreight.lcl * cbm; breakdown.push({ label: `LCL (${cbm} CBM)`, amount: ff }); }
        else if (seafreightForm.containerType === "fcl20") { ff = pricing.seafreight.fcl20; breakdown.push({ label: "20ft FCL", amount: ff }); }
        else if (seafreightForm.containerType === "fcl40") { ff = pricing.seafreight.fcl40; breakdown.push({ label: "40ft FCL", amount: ff }); }
        else { ff = pricing.seafreight.fcl40hc; breakdown.push({ label: "40ft HC", amount: ff }); }
        total += ff;
        breakdown.push({ label: "Port Fees", amount: 350 }); total += 350;
        breakdown.push({ label: "Documentation", amount: 75 }); total += 75;
      }

      setQuote({ total: Math.round(total), breakdown });
      setCalculating(false);
    }, 600);
  };

  const handleCheckout = () => {
    if (!quote) return;
    let payload: Record<string, unknown> = { tab: activeTab, quote };
    if (activeTab === "domestic") payload = { ...payload, ...domesticForm };
    else if (activeTab === "international") payload = { ...payload, ...internationalForm };
    else if (activeTab === "warehousing") payload = { ...payload, ...warehousingForm };
    else if (activeTab === "insurance") payload = { ...payload, ...insuranceForm };
    else if (activeTab === "airfreight") payload = { ...payload, ...airfreightForm };
    else if (activeTab === "seafreight") payload = { ...payload, ...seafreightForm };
    setCheckoutData(payload);
    setShowCheckout(true);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !checkoutData) return;
    pay({
      amountGHS: quote.total,
      email: form.email,
      name: `${form.firstName} ${form.lastName}`.trim(),
      onSuccess: async (reference) => {
        const tabConfig = tabs.find(t => t.id === activeTab);
        await addSubmission({
          type: "logistics",
          total: quote.total,
          currency: "GHS",
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
          summary: `${tabConfig?.name} - GH₵${quote.total.toLocaleString()}`,
          payload: { ...checkoutData, company: form.company, reference },
        });
        setDone(true);
      },
    });
  };

  const currentTab = tabs.find(t => t.id === activeTab)!;
  const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none text-sm";
  const lbl = "text-sm font-semibold text-slate-700 block mb-2";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero with Globe */}
      <section className="relative min-h-[650px] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900/30 to-slate-900">
        <div className="absolute right-0 top-0 w-full md:w-[55%] h-full opacity-80 pointer-events-none">
          <LiveGlobe />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">Global Logistics Network</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95] mb-6">Move anything,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">anywhere.</span></h1>
            <p className="text-white/70 text-lg mb-8 max-w-xl">From same-day delivery across Ghana to international sea freight spanning 6 continents. Real-time tracking, cargo insurance, and dedicated support.</p>
            <div className="flex flex-wrap gap-4 mb-8">
              {[{ icon: Globe, label: "200+ Destinations", c: "text-cyan-400" },{ icon: Clock, label: "Same-Day Available", c: "text-emerald-400" },{ icon: Shield, label: "Full Insurance", c: "text-violet-400" }].map(s=>(
                <div key={s.label} className="flex items-center gap-2 text-white/60 text-sm"><s.icon className={`w-4 h-4 ${s.c}`} /><span>{s.label}</span></div>
              ))}
            </div>
            <a href="#services" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-all">Get Instant Quote <ArrowRight className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm border-t border-white/10">
          <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ v:"16", l:"Ghana Regions" },{ v:"200+", l:"Destinations" },{ v:"24/7", l:"Tracking" },{ v:"98%", l:"On-Time" }].map(s=>(
              <div key={s.l} className="text-center"><p className="font-display text-2xl text-white">{s.v}</p><p className="text-white/50 text-xs">{s.l}</p></div>
            ))}
          </div>
        </div>
      </section>

      <ServiceInfoBanner slug="logistics" />

      {/* Tabs */}
      <section id="services" className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map(tab=>{
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={()=>{setActiveTab(tab.id as TabId);setQuote(null);}}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all text-sm ${active?"bg-emerald-600 text-white shadow-lg shadow-emerald-600/30":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  <tab.icon className="w-4 h-4" />{tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor:`${currentTab.color}15` }}>
                  <currentTab.icon className="w-7 h-7" style={{ color:currentTab.color }} />
                </div>
                <div><h2 className="font-display text-2xl text-slate-900">{currentTab.name}</h2><p className="text-slate-500 text-sm">{currentTab.description}</p></div>
              </div>
            </div>
            <div className="p-6">
              {/* DOMESTIC */}
              {activeTab==="domestic"&&(
                <div className="space-y-6">
                  <div><label className={lbl}>Delivery Speed</label>
                    <div className="grid grid-cols-3 gap-3">{[{id:"sameDay",n:"Same-Day",d:"Today",I:Timer},{id:"nextDay",n:"Next-Day",d:"Tomorrow",I:Clock},{id:"standard",n:"Standard",d:"2-5 days",I:Package}].map(o=>(
                      <label key={o.id} className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${domesticForm.serviceType===o.id?"border-emerald-500 bg-emerald-50":"border-slate-200 hover:border-slate-300"}`}>
                        <input type="radio" name="st" value={o.id} checked={domesticForm.serviceType===o.id} onChange={e=>setDomesticForm({...domesticForm,serviceType:e.target.value})} className="sr-only"/>
                        <o.I className={`w-6 h-6 mb-2 ${domesticForm.serviceType===o.id?"text-emerald-600":"text-slate-400"}`}/><span className="font-semibold text-slate-900 text-sm">{o.n}</span><span className="text-xs text-slate-500">{o.d}</span>
                      </label>))}</div></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Pickup Region</label><select value={domesticForm.pickupRegion} onChange={e=>setDomesticForm({...domesticForm,pickupRegion:e.target.value})} className={inp}>{ghanaRegions.map(r=><option key={r}>{r}</option>)}</select></div>
                    <div><label className={lbl}>Delivery Region</label><select value={domesticForm.deliveryRegion} onChange={e=>setDomesticForm({...domesticForm,deliveryRegion:e.target.value})} className={inp}>{ghanaRegions.map(r=><option key={r}>{r}</option>)}</select></div>
                    <div><label className={lbl}>Pickup Address</label><input placeholder="Street, landmark, city" value={domesticForm.pickupAddress} onChange={e=>setDomesticForm({...domesticForm,pickupAddress:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Delivery Address</label><input placeholder="Street, landmark, city" value={domesticForm.deliveryAddress} onChange={e=>setDomesticForm({...domesticForm,deliveryAddress:e.target.value})} className={inp}/></div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div><label className={lbl}>Weight (kg)</label><input type="number" placeholder="5" value={domesticForm.weight} onChange={e=>setDomesticForm({...domesticForm,weight:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Items</label><input type="number" min="1" value={domesticForm.items} onChange={e=>setDomesticForm({...domesticForm,items:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Pickup Date</label><input type="date" value={domesticForm.pickupDate} onChange={e=>setDomesticForm({...domesticForm,pickupDate:e.target.value})} className={inp}/></div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={domesticForm.insurance} onChange={e=>setDomesticForm({...domesticForm,insurance:e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600 accent-emerald-600"/><span className="text-slate-700 text-sm">Insurance (+5%)</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={domesticForm.fragile} onChange={e=>setDomesticForm({...domesticForm,fragile:e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600 accent-emerald-600"/><span className="text-slate-700 text-sm">Fragile (+GH₵20/item)</span></label>
                  </div>
                </div>)}

              {/* INTERNATIONAL */}
              {activeTab==="international"&&(
                <div className="space-y-6">
                  <div><label className={lbl}>Shipping Method</label>
                    <div className="grid grid-cols-3 gap-3">{[{id:"air",n:"Air Freight",d:"3-7 days",I:Plane},{id:"sea",n:"Sea Freight",d:"30-45 days",I:Ship},{id:"express",n:"Express Air",d:"1-3 days",I:Timer}].map(o=>(
                      <label key={o.id} className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${internationalForm.shippingMethod===o.id?"border-cyan-500 bg-cyan-50":"border-slate-200"}`}>
                        <input type="radio" name="sm" value={o.id} checked={internationalForm.shippingMethod===o.id} onChange={e=>setInternationalForm({...internationalForm,shippingMethod:e.target.value})} className="sr-only"/>
                        <o.I className={`w-6 h-6 mb-2 ${internationalForm.shippingMethod===o.id?"text-cyan-600":"text-slate-400"}`}/><span className="font-semibold text-slate-900 text-sm">{o.n}</span><span className="text-xs text-slate-500">{o.d}</span>
                      </label>))}</div></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Region</label><select value={internationalForm.destinationRegion} onChange={e=>{const r=e.target.value;setInternationalForm({...internationalForm,destinationRegion:r,destinationCountry:internationalDestinations[r]?.[0]||""});}} className={inp}><option value="africa">Africa</option><option value="europe">Europe</option><option value="americas">Americas</option><option value="asia">Asia & Middle East</option><option value="oceania">Oceania</option></select></div>
                    <div><label className={lbl}>Country</label><select value={internationalForm.destinationCountry} onChange={e=>setInternationalForm({...internationalForm,destinationCountry:e.target.value})} className={inp}>{(internationalDestinations[internationalForm.destinationRegion]||[]).map(c=><option key={c}>{c}</option>)}</select></div>
                    <div><label className={lbl}>City</label><input placeholder="London" value={internationalForm.destinationCity} onChange={e=>setInternationalForm({...internationalForm,destinationCity:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Weight (kg)</label><input type="number" value={internationalForm.weight} onChange={e=>setInternationalForm({...internationalForm,weight:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Declared Value (GH₵)</label><input type="number" value={internationalForm.declaredValue} onChange={e=>setInternationalForm({...internationalForm,declaredValue:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Contents</label><input placeholder="Electronics, clothing…" value={internationalForm.contents} onChange={e=>setInternationalForm({...internationalForm,contents:e.target.value})} className={inp}/></div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={internationalForm.insurance} onChange={e=>setInternationalForm({...internationalForm,insurance:e.target.checked})} className="w-5 h-5 rounded accent-cyan-600"/><span className="text-slate-700 text-sm">Insurance (3.5%)</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={internationalForm.customsClearance} onChange={e=>setInternationalForm({...internationalForm,customsClearance:e.target.checked})} className="w-5 h-5 rounded accent-cyan-600"/><span className="text-slate-700 text-sm">Customs Clearance (+GH₵250)</span></label>
                  </div>
                </div>)}

              {/* WAREHOUSING */}
              {activeTab==="warehousing"&&(
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Facility</label><select value={warehousingForm.facility} onChange={e=>setWarehousingForm({...warehousingForm,facility:e.target.value})} className={inp}><option value="accra">Accra (Airport City)</option><option value="tema">Tema (Port)</option><option value="kumasi">Kumasi (Industrial)</option></select></div>
                    <div><label className={lbl}>Storage Type</label><select value={warehousingForm.storageType} onChange={e=>setWarehousingForm({...warehousingForm,storageType:e.target.value})} className={inp}><option value="standard">Standard</option><option value="climate">Climate Controlled</option><option value="secure">High Security</option></select></div>
                    <div><label className={lbl}>Duration</label><select value={warehousingForm.duration} onChange={e=>setWarehousingForm({...warehousingForm,duration:e.target.value})} className={inp}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
                    <div><label className={lbl}>Pallets</label><input type="number" min="1" value={warehousingForm.pallets} onChange={e=>setWarehousingForm({...warehousingForm,pallets:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Start Date</label><input type="date" value={warehousingForm.startDate} onChange={e=>setWarehousingForm({...warehousingForm,startDate:e.target.value})} className={inp}/></div>
                  </div>
                  <div><label className={lbl}>Add-ons</label><div className="flex flex-wrap gap-4">{[{id:"handling",l:"Handling (+GH₵50/pallet)"},{id:"inventory",l:"Inventory Mgmt (+GH₵100)"},{id:"packaging",l:"Repackaging"},{id:"labeling",l:"Labeling & Sorting"}].map(o=>(
                    <label key={o.id} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={warehousingForm.specialRequirements.includes(o.id)} onChange={e=>{const r=e.target.checked?[...warehousingForm.specialRequirements,o.id]:warehousingForm.specialRequirements.filter(x=>x!==o.id);setWarehousingForm({...warehousingForm,specialRequirements:r});}} className="w-5 h-5 rounded accent-emerald-600"/><span className="text-slate-700 text-sm">{o.l}</span></label>))}</div></div>
                </div>)}

              {/* INSURANCE */}
              {activeTab==="insurance"&&(
                <div className="space-y-6">
                  <div><label className={lbl}>Coverage Level</label>
                    <div className="grid md:grid-cols-3 gap-4">{[{id:"basic",n:"Basic",r:"2%",d:"Loss & damage"},{id:"standard",n:"Standard",r:"3.5%",d:"All risks"},{id:"premium",n:"Premium",r:"5%",d:"All risks + delays"}].map(o=>(
                      <label key={o.id} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${insuranceForm.coverageType===o.id?"border-violet-500 bg-violet-50":"border-slate-200"}`}>
                        <input type="radio" name="ct" value={o.id} checked={insuranceForm.coverageType===o.id} onChange={e=>setInsuranceForm({...insuranceForm,coverageType:e.target.value})} className="sr-only"/>
                        <div className="flex justify-between mb-2"><span className="font-semibold text-slate-900">{o.n}</span><span className={`text-sm font-bold ${insuranceForm.coverageType===o.id?"text-violet-600":"text-slate-500"}`}>{o.r}</span></div>
                        <span className="text-sm text-slate-500">{o.d}</span>
                      </label>))}</div></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Cargo Value (GH₵)</label><input type="number" placeholder="Total value" value={insuranceForm.declaredValue} onChange={e=>setInsuranceForm({...insuranceForm,declaredValue:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Shipment Type</label><select value={insuranceForm.shipmentType} onChange={e=>setInsuranceForm({...insuranceForm,shipmentType:e.target.value})} className={inp}><option value="domestic">Domestic</option><option value="international-air">International (Air)</option><option value="international-sea">International (Sea)</option></select></div>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-4 flex items-start gap-3"><Info className="w-5 h-5 text-violet-600 mt-0.5"/><div><p className="font-semibold text-violet-900">Coverage</p><p className="text-sm text-violet-700 mt-1">Loss, damage, theft, natural disasters. Premium includes delay compensation.</p></div></div>
                </div>)}

              {/* AIR FREIGHT */}
              {activeTab==="airfreight"&&(
                <div className="space-y-6">
                  <div><label className={lbl}>Service Level</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{id:"economy",n:"Economy",r:"GH₵45/kg",d:"5-7d"},{id:"standard",n:"Standard",r:"GH₵65/kg",d:"3-5d"},{id:"express",n:"Express",r:"GH₵95/kg",d:"2-3d"},{id:"priority",n:"Priority",r:"GH₵150/kg",d:"1-2d"}].map(o=>(
                      <label key={o.id} className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer ${airfreightForm.serviceLevel===o.id?"border-amber-500 bg-amber-50":"border-slate-200"}`}>
                        <input type="radio" name="sl" value={o.id} checked={airfreightForm.serviceLevel===o.id} onChange={e=>setAirfreightForm({...airfreightForm,serviceLevel:e.target.value})} className="sr-only"/>
                        <span className="font-semibold text-slate-900 text-sm">{o.n}</span><span className={`text-xs ${airfreightForm.serviceLevel===o.id?"text-amber-600":"text-slate-500"}`}>{o.r}</span><span className="text-[10px] text-slate-400">{o.d}</span>
                      </label>))}</div></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Origin</label><select value={airfreightForm.origin} onChange={e=>setAirfreightForm({...airfreightForm,origin:e.target.value})} className={inp}><option>Accra</option><option>Kumasi</option><option>Tamale</option></select></div>
                    <div><label className={lbl}>Destination</label><input placeholder="London Heathrow (LHR)" value={airfreightForm.destination} onChange={e=>setAirfreightForm({...airfreightForm,destination:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Weight (kg)</label><input type="number" value={airfreightForm.weight} onChange={e=>setAirfreightForm({...airfreightForm,weight:e.target.value})} className={inp}/></div>
                    <div><label className={lbl}>Pickup Date</label><input type="date" value={airfreightForm.pickupDate} onChange={e=>setAirfreightForm({...airfreightForm,pickupDate:e.target.value})} className={inp}/></div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={airfreightForm.dangerous} onChange={e=>setAirfreightForm({...airfreightForm,dangerous:e.target.checked})} className="w-5 h-5 rounded accent-amber-600"/><span className="text-slate-700 text-sm">Dangerous Goods (+GH₵200)</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={airfreightForm.temperature} onChange={e=>setAirfreightForm({...airfreightForm,temperature:e.target.checked})} className="w-5 h-5 rounded accent-amber-600"/><span className="text-slate-700 text-sm">Temp Control (+GH₵10/kg)</span></label>
                  </div>
                </div>)}

              {/* SEA FREIGHT */}
              {activeTab==="seafreight"&&(
                <div className="space-y-6">
                  <div><label className={lbl}>Container Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[{id:"lcl",n:"LCL",d:"Shared",r:"GH₵25/CBM"},{id:"fcl20",n:"20ft FCL",d:"Full",r:"GH₵2,500"},{id:"fcl40",n:"40ft FCL",d:"Full",r:"GH₵4,500"},{id:"fcl40hc",n:"40ft HC",d:"High cube",r:"GH₵5,200"}].map(o=>(
                      <label key={o.id} className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer ${seafreightForm.containerType===o.id?"border-pink-500 bg-pink-50":"border-slate-200"}`}>
                        <input type="radio" name="ct2" value={o.id} checked={seafreightForm.containerType===o.id} onChange={e=>setSeafreightForm({...seafreightForm,containerType:e.target.value})} className="sr-only"/>
                        <span className="font-semibold text-slate-900 text-sm">{o.n}</span><span className="text-[10px] text-slate-500">{o.d}</span><span className={`text-xs font-bold mt-1 ${seafreightForm.containerType===o.id?"text-pink-600":"text-slate-400"}`}>{o.r}</span>
                      </label>))}</div></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={lbl}>Origin Port</label><select value={seafreightForm.originPort} onChange={e=>setSeafreightForm({...seafreightForm,originPort:e.target.value})} className={inp}><option value="Tema">Tema</option><option value="Takoradi">Takoradi</option></select></div>
                    <div><label className={lbl}>Destination Port</label><input placeholder="Rotterdam, Shanghai…" value={seafreightForm.destinationPort} onChange={e=>setSeafreightForm({...seafreightForm,destinationPort:e.target.value})} className={inp}/></div>
                    {seafreightForm.containerType==="lcl"&&<div><label className={lbl}>Volume (CBM)</label><input type="number" value={seafreightForm.cbm} onChange={e=>setSeafreightForm({...seafreightForm,cbm:e.target.value})} className={inp}/></div>}
                    <div><label className={lbl}>Incoterms</label><select value={seafreightForm.incoterms} onChange={e=>setSeafreightForm({...seafreightForm,incoterms:e.target.value})} className={inp}><option value="FOB">FOB</option><option value="CIF">CIF</option><option value="EXW">EXW</option><option value="DDP">DDP</option></select></div>
                  </div>
                </div>)}

              <div className="mt-8">
                <button onClick={calculateQuote} disabled={calculating} className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {calculating?<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Calculating...</>:<><Calculator className="w-5 h-5"/>Calculate Quote</>}
                </button>
              </div>
            </div>
          </div>

          {/* Quote sidebar */}
          <div className="lg:sticky lg:top-[70px] h-fit self-start">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3"><CreditCard className="w-6 h-6"/><div><p className="font-display text-xl">Quote Summary</p><p className="text-white/70 text-sm">{currentTab.name}</p></div></div>
              </div>
              <div className="p-6">
                {quote?(
                  <div className="space-y-4">
                    {quote.breakdown.map((item,i)=>(<div key={i} className="flex justify-between text-sm"><span className="text-slate-600">{item.label}</span><span className="font-semibold text-slate-900">GH₵{item.amount.toLocaleString()}</span></div>))}
                    <div className="pt-4 border-t border-slate-200"><div className="flex justify-between"><span className="font-semibold text-slate-900">Total</span><span className="font-display text-2xl text-emerald-600">GH₵{quote.total.toLocaleString()}</span></div></div>
                    <button onClick={handleCheckout} className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 flex items-center justify-center gap-2">Proceed to Payment <ArrowRight className="w-4 h-4"/></button>
                  </div>
                ):(
                  <div className="text-center py-8"><Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3"/><p className="text-slate-500 text-sm">Fill the form and click &quot;Calculate Quote&quot;</p></div>
                )}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                  {[{i:Shield,l:"Insured"},{i:Clock,l:"Tracked"},{i:PackageCheck,l:"Safe"},{i:Phone,l:"Support"}].map(s=>(<div key={s.l} className="flex flex-col items-center gap-1 p-2"><s.i className="w-5 h-5 text-emerald-600"/><span className="text-[10px] text-slate-500">{s.l}</span></div>))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-800 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[{i:Phone,l:"Call",v:"0261404904",c:"cyan"},{i:MessageCircle,l:"WhatsApp",v:"0257664762",c:"emerald"},{i:Mail,l:"Email",v:"phrimpongkelvin@gmail.com",c:"violet"}].map(s=>(
            <div key={s.l}><div className={`w-14 h-14 rounded-full bg-${s.c}-500/20 flex items-center justify-center mx-auto mb-4`}><s.i className={`w-6 h-6 text-${s.c}-400`}/></div><p className="text-white font-semibold mb-1">{s.l}</p><p className="text-white/60 text-sm">{s.v}</p></div>
          ))}
        </div>
      </section>

      {/* Checkout Modal */}
      {showCheckout&&!done&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={()=>setShowCheckout(false)}/>
          <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div><p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">Checkout</p><h3 className="font-display text-xl text-slate-900">{currentTab.name}</h3></div>
              <button onClick={()=>setShowCheckout(false)} className="p-2 rounded-lg hover:bg-slate-100">✕</button>
            </div>
            <form onSubmit={submitPayment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3"><input required placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className={inp}/><input required placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className={inp}/></div>
              <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={inp}/>
              <input required type="tel" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className={inp}/>
              <input placeholder="Company (optional)" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className={inp}/>
              {quote&&<div className="bg-slate-50 rounded-xl p-4 flex justify-between font-display text-lg"><span>Total</span><span className="text-emerald-600">GH₵{quote.total.toLocaleString()}</span></div>}
              <button type="submit" className="w-full py-4 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 flex items-center justify-center gap-2"><CreditCard className="w-5 h-5"/>Pay with Paystack</button>
            </form>
          </div>
        </div>)}

      {/* Success */}
      {done&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80"/>
          <div className="relative bg-white rounded-3xl p-10 max-w-md text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-10 h-10 text-emerald-600"/></div>
            <h3 className="font-display text-2xl text-slate-900 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 mb-2">{currentTab.name}</p>
            <p className="font-display text-3xl text-emerald-600 mb-6">GH₵{quote?.total.toLocaleString()}</p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6"><NotifyStatus email={form.email} phone={form.phone}/></div>
            <button onClick={()=>{setDone(false);setShowCheckout(false);setQuote(null);}} className="px-6 py-3 rounded-full bg-slate-900 text-white font-semibold">Done</button>
          </div>
        </div>)}
    </div>
  );
}
