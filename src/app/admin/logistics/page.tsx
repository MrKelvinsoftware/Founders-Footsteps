"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, Edit2, X, CheckCircle,
  Truck, Globe, Warehouse, Shield, Plane, Ship, MapPin, DollarSign,
  GripVertical, Eye, EyeOff
} from "lucide-react";

const STORAGE_KEY = "ff_logistics_cms";

type ServiceTab = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
};

type DeliveryZone = {
  id: string;
  name: string;
  regions: string[];
  sameDayPrice: number;
  nextDayPrice: number;
  standardPrice: number;
  enabled: boolean;
};

type InternationalRoute = {
  id: string;
  region: string;
  countries: string[];
  airPrice: number;
  seaPrice: number;
  expressPrice: number;
  transitDays: { air: string; sea: string; express: string };
  enabled: boolean;
};

type WarehouseFacility = {
  id: string;
  name: string;
  location: string;
  address: string;
  standardDaily: number;
  standardWeekly: number;
  standardMonthly: number;
  climateDaily: number;
  climateWeekly: number;
  climateMonthly: number;
  secureDaily: number;
  secureWeekly: number;
  secureMonthly: number;
  enabled: boolean;
};

type InsurancePlan = {
  id: string;
  name: string;
  rate: number;
  coverage: string;
  description: string;
  enabled: boolean;
};

type FreightService = {
  id: string;
  name: string;
  type: "air" | "sea";
  pricePerUnit: number;
  unit: string;
  transitTime: string;
  description: string;
  enabled: boolean;
};

type LogisticsConfig = {
  serviceTabs: ServiceTab[];
  deliveryZones: DeliveryZone[];
  internationalRoutes: InternationalRoute[];
  warehouses: WarehouseFacility[];
  insurancePlans: InsurancePlan[];
  freightServices: FreightService[];
  globalSettings: {
    fuelSurchargePercent: number;
    documentationFee: number;
    portFees: number;
    customsClearanceFee: number;
    weightSurchargePerKg: number;
    weightThresholdKg: number;
  };
};

const defaultConfig: LogisticsConfig = {
  serviceTabs: [
    { id: "domestic", name: "Domestic Delivery", icon: "Truck", color: "#2563eb", description: "Same-day and next-day delivery across all 16 regions of Ghana.", enabled: true },
    { id: "international", name: "International Shipping", icon: "Globe", color: "#0891b2", description: "Worldwide air & sea freight with door-to-door tracking.", enabled: true },
    { id: "warehousing", name: "Warehousing", icon: "Warehouse", color: "#059669", description: "Climate-controlled storage facilities in Accra, Tema & Kumasi.", enabled: true },
    { id: "insurance", name: "Cargo Insurance", icon: "Shield", color: "#7c3aed", description: "Full-value coverage on every shipment, no exceptions.", enabled: true },
    { id: "airfreight", name: "Air Freight", icon: "Plane", color: "#d97706", description: "Express air cargo to 200+ destinations worldwide.", enabled: true },
    { id: "seafreight", name: "Sea Freight", icon: "Ship", color: "#c026d3", description: "FCL & LCL container shipping with port-to-port service.", enabled: true },
  ],
  deliveryZones: [
    { id: "accra", name: "Greater Accra", regions: ["Greater Accra"], sameDayPrice: 80, nextDayPrice: 50, standardPrice: 30, enabled: true },
    { id: "ashanti", name: "Ashanti Region", regions: ["Ashanti"], sameDayPrice: 150, nextDayPrice: 100, standardPrice: 70, enabled: true },
    { id: "northern", name: "Northern Zones", regions: ["Northern", "Upper East", "Upper West", "Savannah", "North East"], sameDayPrice: 220, nextDayPrice: 180, standardPrice: 120, enabled: true },
    { id: "coastal", name: "Coastal Regions", regions: ["Western", "Central", "Volta"], sameDayPrice: 150, nextDayPrice: 100, standardPrice: 70, enabled: true },
  ],
  internationalRoutes: [
    { id: "africa", region: "Africa", countries: ["Nigeria", "South Africa", "Kenya", "Egypt", "Morocco", "Senegal"], airPrice: 400, seaPrice: 200, expressPrice: 600, transitDays: { air: "3-5 days", sea: "15-20 days", express: "1-2 days" }, enabled: true },
    { id: "europe", region: "Europe", countries: ["United Kingdom", "Germany", "France", "Netherlands", "Italy", "Spain"], airPrice: 850, seaPrice: 450, expressPrice: 1200, transitDays: { air: "5-7 days", sea: "30-35 days", express: "2-3 days" }, enabled: true },
    { id: "americas", region: "Americas", countries: ["United States", "Canada", "Brazil", "Mexico"], airPrice: 1200, seaPrice: 600, expressPrice: 1800, transitDays: { air: "7-10 days", sea: "35-45 days", express: "3-4 days" }, enabled: true },
    { id: "asia", region: "Asia & Middle East", countries: ["China", "UAE", "India", "Singapore", "Japan", "Saudi Arabia"], airPrice: 950, seaPrice: 350, expressPrice: 1400, transitDays: { air: "5-8 days", sea: "25-35 days", express: "2-3 days" }, enabled: true },
    { id: "oceania", region: "Oceania", countries: ["Australia", "New Zealand"], airPrice: 1400, seaPrice: 800, expressPrice: 2000, transitDays: { air: "8-12 days", sea: "40-50 days", express: "4-5 days" }, enabled: true },
  ],
  warehouses: [
    { id: "accra", name: "Accra Warehouse", location: "Airport City", address: "Independence Avenue, Airport City, Accra", standardDaily: 5, standardWeekly: 30, standardMonthly: 100, climateDaily: 10, climateWeekly: 60, climateMonthly: 200, secureDaily: 15, secureWeekly: 90, secureMonthly: 300, enabled: true },
    { id: "tema", name: "Tema Port Warehouse", location: "Port Area", address: "Harbour Road, Tema Industrial Area", standardDaily: 4, standardWeekly: 25, standardMonthly: 85, climateDaily: 8, climateWeekly: 50, climateMonthly: 170, secureDaily: 12, secureWeekly: 75, secureMonthly: 250, enabled: true },
    { id: "kumasi", name: "Kumasi Hub", location: "Industrial Area", address: "Asokwa Industrial Area, Kumasi", standardDaily: 4, standardWeekly: 25, standardMonthly: 80, climateDaily: 8, climateWeekly: 48, climateMonthly: 160, secureDaily: 12, secureWeekly: 70, secureMonthly: 230, enabled: true },
  ],
  insurancePlans: [
    { id: "basic", name: "Basic Coverage", rate: 2, coverage: "Loss & Damage", description: "Covers total loss and physical damage during transit", enabled: true },
    { id: "standard", name: "Standard Coverage", rate: 3.5, coverage: "All Risks", description: "Comprehensive coverage including theft, water damage, and accidents", enabled: true },
    { id: "premium", name: "Premium Coverage", rate: 5, coverage: "All Risks + Delays", description: "Full coverage plus compensation for delays and missed deadlines", enabled: true },
  ],
  freightServices: [
    { id: "air-economy", name: "Economy Air", type: "air", pricePerUnit: 45, unit: "kg", transitTime: "5-7 days", description: "Budget-friendly air freight option", enabled: true },
    { id: "air-standard", name: "Standard Air", type: "air", pricePerUnit: 65, unit: "kg", transitTime: "3-5 days", description: "Balanced speed and cost", enabled: true },
    { id: "air-express", name: "Express Air", type: "air", pricePerUnit: 95, unit: "kg", transitTime: "2-3 days", description: "Fast delivery for urgent shipments", enabled: true },
    { id: "air-priority", name: "Priority Air", type: "air", pricePerUnit: 150, unit: "kg", transitTime: "1-2 days", description: "Fastest available option", enabled: true },
    { id: "sea-lcl", name: "LCL (Less than Container)", type: "sea", pricePerUnit: 25, unit: "CBM", transitTime: "30-45 days", description: "Shared container for smaller shipments", enabled: true },
    { id: "sea-fcl20", name: "20ft Container (FCL)", type: "sea", pricePerUnit: 2500, unit: "container", transitTime: "30-40 days", description: "Full 20-foot container", enabled: true },
    { id: "sea-fcl40", name: "40ft Container (FCL)", type: "sea", pricePerUnit: 4500, unit: "container", transitTime: "30-40 days", description: "Full 40-foot container", enabled: true },
    { id: "sea-fcl40hc", name: "40ft High Cube (FCL)", type: "sea", pricePerUnit: 5200, unit: "container", transitTime: "30-40 days", description: "Extra tall 40-foot container", enabled: true },
  ],
  globalSettings: {
    fuelSurchargePercent: 15,
    documentationFee: 75,
    portFees: 350,
    customsClearanceFee: 250,
    weightSurchargePerKg: 5,
    weightThresholdKg: 5,
  },
};

const iconMap: Record<string, React.ElementType> = {
  Truck, Globe, Warehouse, Shield, Plane, Ship
};

type ActiveSection = "tabs" | "domestic" | "international" | "warehouses" | "insurance" | "freight" | "settings";

export default function AdminLogisticsPage() {
  const [config, setConfig] = useState<LogisticsConfig>(defaultConfig);
  const [activeSection, setActiveSection] = useState<ActiveSection>("tabs");
  const [saved, setSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.error("Failed to load logistics config:", e);
      }
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateServiceTab = (id: string, updates: Partial<ServiceTab>) => {
    setConfig(prev => ({
      ...prev,
      serviceTabs: prev.serviceTabs.map(tab => tab.id === id ? { ...tab, ...updates } : tab)
    }));
  };

  const updateDeliveryZone = (id: string, updates: Partial<DeliveryZone>) => {
    setConfig(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map(zone => zone.id === id ? { ...zone, ...updates } : zone)
    }));
  };

  const updateInternationalRoute = (id: string, updates: Partial<InternationalRoute>) => {
    setConfig(prev => ({
      ...prev,
      internationalRoutes: prev.internationalRoutes.map(route => route.id === id ? { ...route, ...updates } : route)
    }));
  };

  const updateWarehouse = (id: string, updates: Partial<WarehouseFacility>) => {
    setConfig(prev => ({
      ...prev,
      warehouses: prev.warehouses.map(wh => wh.id === id ? { ...wh, ...updates } : wh)
    }));
  };

  const updateInsurancePlan = (id: string, updates: Partial<InsurancePlan>) => {
    setConfig(prev => ({
      ...prev,
      insurancePlans: prev.insurancePlans.map(plan => plan.id === id ? { ...plan, ...updates } : plan)
    }));
  };

  const updateFreightService = (id: string, updates: Partial<FreightService>) => {
    setConfig(prev => ({
      ...prev,
      freightServices: prev.freightServices.map(svc => svc.id === id ? { ...svc, ...updates } : svc)
    }));
  };

  const sections = [
    { id: "tabs", name: "Service Tabs", icon: GripVertical, count: config.serviceTabs.filter(t => t.enabled).length },
    { id: "domestic", name: "Domestic Zones", icon: MapPin, count: config.deliveryZones.filter(z => z.enabled).length },
    { id: "international", name: "International Routes", icon: Globe, count: config.internationalRoutes.filter(r => r.enabled).length },
    { id: "warehouses", name: "Warehouses", icon: Warehouse, count: config.warehouses.filter(w => w.enabled).length },
    { id: "insurance", name: "Insurance Plans", icon: Shield, count: config.insurancePlans.filter(p => p.enabled).length },
    { id: "freight", name: "Freight Services", icon: Ship, count: config.freightServices.filter(s => s.enabled).length },
    { id: "settings", name: "Global Settings", icon: DollarSign, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/services" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">Logistics CMS</p>
              <h1 className="font-display text-2xl text-slate-900 leading-none">Global Logistics Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
            <button onClick={saveConfig} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700" >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-4 sticky top-[73px] self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Sections</p>
          <nav className="space-y-1">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as ActiveSection)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive ? "bg-emerald-600 text-white" : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <section.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{section.name}</span>
                  </span>
                  {section.count !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                      {section.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Service Tabs */}
            {activeSection === "tabs" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Service Tabs</h2>
                    <p className="text-slate-500">Enable/disable and customize the main logistics service tabs</p>
                  </div>
                </div>
                {config.serviceTabs.map((tab) => {
                  const Icon = iconMap[tab.icon] || Truck;
                  return (
                    <div key={tab.id} className={`bg-white rounded-2xl border p-5 ${tab.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tab.color}15` }}>
                          <Icon className="w-6 h-6" style={{ color: tab.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={tab.name}
                              onChange={(e) => updateServiceTab(tab.id, { name: e.target.value })}
                              className="font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none px-1 -ml-1"
                            />
                            <button
                              onClick={() => updateServiceTab(tab.id, { enabled: !tab.enabled })}
                              className={`p-2 rounded-lg ${tab.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                            >
                              {tab.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                          </div>
                          <textarea
                            value={tab.description}
                            onChange={(e) => updateServiceTab(tab.id, { description: e.target.value })}
                            className="w-full text-sm text-slate-600 bg-transparent border border-transparent hover:border-slate-200 focus:border-emerald-500 focus:outline-none rounded-lg p-2 -ml-2 resize-none"
                            rows={2}
                          />
                          <div className="flex items-center gap-3 mt-2">
                            <label className="text-xs text-slate-500">Color:</label>
                            <input
                              type="color"
                              value={tab.color}
                              onChange={(e) => updateServiceTab(tab.id, { color: e.target.value })}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Domestic Zones */}
            {activeSection === "domestic" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Domestic Delivery Zones</h2>
                    <p className="text-slate-500">Configure pricing for different regions in Ghana</p>
                  </div>
                </div>
                {config.deliveryZones.map((zone) => (
                  <div key={zone.id} className={`bg-white rounded-2xl border p-5 ${zone.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => updateDeliveryZone(zone.id, { name: e.target.value })}
                          className="font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => updateDeliveryZone(zone.id, { enabled: !zone.enabled })}
                        className={`p-2 rounded-lg ${zone.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {zone.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Same-Day (GH₵)</label>
                        <input
                          type="number"
                          value={zone.sameDayPrice}
                          onChange={(e) => updateDeliveryZone(zone.id, { sameDayPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next-Day (GH₵)</label>
                        <input
                          type="number"
                          value={zone.nextDayPrice}
                          onChange={(e) => updateDeliveryZone(zone.id, { nextDayPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Standard (GH₵)</label>
                        <input
                          type="number"
                          value={zone.standardPrice}
                          onChange={(e) => updateDeliveryZone(zone.id, { standardPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-500">Regions covered:</label>
                      <p className="text-sm text-slate-600">{zone.regions.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* International Routes */}
            {activeSection === "international" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">International Routes</h2>
                    <p className="text-slate-500">Configure pricing for international shipping destinations</p>
                  </div>
                </div>
                {config.internationalRoutes.map((route) => (
                  <div key={route.id} className={`bg-white rounded-2xl border p-5 ${route.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-600" />
                        <span className="font-semibold text-slate-900">{route.region}</span>
                      </div>
                      <button
                        onClick={() => updateInternationalRoute(route.id, { enabled: !route.enabled })}
                        className={`p-2 rounded-lg ${route.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {route.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Air Freight (GH₵)</label>
                        <input
                          type="number"
                          value={route.airPrice}
                          onChange={(e) => updateInternationalRoute(route.id, { airPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">{route.transitDays.air}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sea Freight (GH₵)</label>
                        <input
                          type="number"
                          value={route.seaPrice}
                          onChange={(e) => updateInternationalRoute(route.id, { seaPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">{route.transitDays.sea}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Express (GH₵)</label>
                        <input
                          type="number"
                          value={route.expressPrice}
                          onChange={(e) => updateInternationalRoute(route.id, { expressPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">{route.transitDays.express}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">Countries: {route.countries.join(", ")}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Warehouses */}
            {activeSection === "warehouses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Warehouse Facilities</h2>
                    <p className="text-slate-500">Configure storage pricing at each location</p>
                  </div>
                </div>
                {config.warehouses.map((wh) => (
                  <div key={wh.id} className={`bg-white rounded-2xl border p-5 ${wh.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-5 h-5 text-emerald-600" />
                          <input
                            type="text"
                            value={wh.name}
                            onChange={(e) => updateWarehouse(wh.id, { name: e.target.value })}
                            className="font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{wh.address}</p>
                      </div>
                      <button
                        onClick={() => updateWarehouse(wh.id, { enabled: !wh.enabled })}
                        className={`p-2 rounded-lg ${wh.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {wh.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Standard Storage (GH₵ per pallet)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-slate-400">Daily</label>
                            <input type="number" value={wh.standardDaily} onChange={(e) => updateWarehouse(wh.id, { standardDaily: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Weekly</label>
                            <input type="number" value={wh.standardWeekly} onChange={(e) => updateWarehouse(wh.id, { standardWeekly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400">Monthly</label>
                            <input type="number" value={wh.standardMonthly} onChange={(e) => updateWarehouse(wh.id, { standardMonthly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Climate Controlled (GH₵ per pallet)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="number" value={wh.climateDaily} onChange={(e) => updateWarehouse(wh.id, { climateDaily: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          <input type="number" value={wh.climateWeekly} onChange={(e) => updateWarehouse(wh.id, { climateWeekly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          <input type="number" value={wh.climateMonthly} onChange={(e) => updateWarehouse(wh.id, { climateMonthly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">High Security (GH₵ per pallet)</p>
                        <div className="grid grid-cols-3 gap-3">
                          <input type="number" value={wh.secureDaily} onChange={(e) => updateWarehouse(wh.id, { secureDaily: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          <input type="number" value={wh.secureWeekly} onChange={(e) => updateWarehouse(wh.id, { secureWeekly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                          <input type="number" value={wh.secureMonthly} onChange={(e) => updateWarehouse(wh.id, { secureMonthly: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Insurance Plans */}
            {activeSection === "insurance" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Insurance Plans</h2>
                    <p className="text-slate-500">Configure cargo insurance options</p>
                  </div>
                </div>
                {config.insurancePlans.map((plan) => (
                  <div key={plan.id} className={`bg-white rounded-2xl border p-5 ${plan.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-violet-600" />
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => updateInsurancePlan(plan.id, { name: e.target.value })}
                          className="font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => updateInsurancePlan(plan.id, { enabled: !plan.enabled })}
                        className={`p-2 rounded-lg ${plan.enabled ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}
                      >
                        {plan.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={plan.rate}
                          onChange={(e) => updateInsurancePlan(plan.id, { rate: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coverage</label>
                        <input
                          type="text"
                          value={plan.coverage}
                          onChange={(e) => updateInsurancePlan(plan.id, { coverage: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea
                        value={plan.description}
                        onChange={(e) => updateInsurancePlan(plan.id, { description: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Freight Services */}
            {activeSection === "freight" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Freight Services</h2>
                    <p className="text-slate-500">Configure air and sea freight pricing</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2"><Plane className="w-5 h-5 text-amber-600" /> Air Freight</h3>
                    <div className="space-y-3">
                      {config.freightServices.filter(s => s.type === "air").map((svc) => (
                        <div key={svc.id} className={`bg-white rounded-xl border p-4 ${svc.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={svc.name}
                              onChange={(e) => updateFreightService(svc.id, { name: e.target.value })}
                              className="font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">GH₵</span>
                                <input
                                  type="number"
                                  value={svc.pricePerUnit}
                                  onChange={(e) => updateFreightService(svc.id, { pricePerUnit: parseFloat(e.target.value) || 0 })}
                                  className="w-20 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-right"
                                />
                                <span className="text-sm text-slate-500">/{svc.unit}</span>
                              </div>
                              <button
                                onClick={() => updateFreightService(svc.id, { enabled: !svc.enabled })}
                                className={`p-1.5 rounded-lg ${svc.enabled ? "text-emerald-600" : "text-slate-400"}`}
                              >
                                {svc.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{svc.transitTime} • {svc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2"><Ship className="w-5 h-5 text-pink-600" /> Sea Freight</h3>
                    <div className="space-y-3">
                      {config.freightServices.filter(s => s.type === "sea").map((svc) => (
                        <div key={svc.id} className={`bg-white rounded-xl border p-4 ${svc.enabled ? "border-slate-200" : "border-slate-200 opacity-60"}`}>
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={svc.name}
                              onChange={(e) => updateFreightService(svc.id, { name: e.target.value })}
                              className="font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">GH₵</span>
                                <input
                                  type="number"
                                  value={svc.pricePerUnit}
                                  onChange={(e) => updateFreightService(svc.id, { pricePerUnit: parseFloat(e.target.value) || 0 })}
                                  className="w-24 px-2 py-1 rounded border border-slate-200 focus:border-emerald-500 focus:outline-none text-right"
                                />
                                <span className="text-sm text-slate-500">/{svc.unit}</span>
                              </div>
                              <button
                                onClick={() => updateFreightService(svc.id, { enabled: !svc.enabled })}
                                className={`p-1.5 rounded-lg ${svc.enabled ? "text-emerald-600" : "text-slate-400"}`}
                              >
                                {svc.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{svc.transitTime} • {svc.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Global Settings */}
            {activeSection === "settings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Global Settings</h2>
                    <p className="text-slate-500">Configure fees and surcharges applied to all shipments</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Fuel Surcharge (%)</label>
                      <input
                        type="number"
                        value={config.globalSettings.fuelSurchargePercent}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, fuelSurchargePercent: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Applied to air freight shipments</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Documentation Fee (GH₵)</label>
                      <input
                        type="number"
                        value={config.globalSettings.documentationFee}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, documentationFee: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Applied to sea freight shipments</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Port & Terminal Fees (GH₵)</label>
                      <input
                        type="number"
                        value={config.globalSettings.portFees}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, portFees: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Applied to sea freight shipments</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Customs Clearance Fee (GH₵)</label>
                      <input
                        type="number"
                        value={config.globalSettings.customsClearanceFee}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, customsClearanceFee: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Optional service for international shipments</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Weight Threshold (kg)</label>
                      <input
                        type="number"
                        value={config.globalSettings.weightThresholdKg}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, weightThresholdKg: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Weight above this incurs extra charges</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Weight Surcharge (GH₵/kg)</label>
                      <input
                        type="number"
                        value={config.globalSettings.weightSurchargePerKg}
                        onChange={(e) => setConfig(prev => ({ ...prev, globalSettings: { ...prev.globalSettings, weightSurchargePerKg: parseFloat(e.target.value) || 0 } }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">Per kg above threshold</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
