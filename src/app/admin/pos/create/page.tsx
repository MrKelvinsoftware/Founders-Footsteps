"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, Building2, Plane, PartyPopper,
  Wrench, FileText, Calculator, User, Phone, Mail, MapPin,
  Calendar, Clock, RefreshCw
} from "lucide-react";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  section?: string;
};

type TripDetails = {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  passengers: number;
  seatClass: string;
  vehicleType: string;
  bookingRef: string;
};

const typeConfig: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
  construction_estimate: { title: "Construction Estimate", icon: <Building2 className="w-5 h-5" />, color: "text-slate-600" },
  trip_ticket: { title: "Trip Ticket", icon: <Plane className="w-5 h-5" />, color: "text-cyan-600" },
  event_receipt: { title: "Event Receipt", icon: <PartyPopper className="w-5 h-5" />, color: "text-amber-600" },
  service_receipt: { title: "Service Receipt", icon: <Wrench className="w-5 h-5" />, color: "text-purple-600" },
};

export default function CreateReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "service_receipt";
  const config = typeConfig[type] || typeConfig.service_receipt;

  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [validDays, setValidDays] = useState(14);
  const [currency, setCurrency] = useState("GHS");
  const [laborCost, setLaborCost] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  // Trip details (for trip_ticket type)
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    origin: "",
    destination: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    passengers: 1,
    seatClass: "Standard",
    vehicleType: "Bus",
    bookingRef: "",
  });

  // Auto-generate default content based on type
  useEffect(() => {
    if (type === "construction_estimate") {
      setTitle("Interior & Roofing Repairs Project");
      setTerms(`• Validity: Prices quoted are valid for ${validDays} calendar days.
• Material Fluctuations: Prices reflect current market rates and are subject to verification upon order placement.
• Workmanship / Workman Charge: Workman fee is required and will be evaluated and filled in following the physical site visit inspection.
• Payment Structure: Advance deposit required prior to material mobilization; balance due upon completion.`);
      setNotes("All materials are subject to availability. Delivery within Greater Accra region included.");
    } else if (type === "event_receipt") {
      setTitle("Event & Catering Service");
      setTerms(`• Full payment required before event date.
• Cancellation within 48 hours of event will incur 50% charge.
• Menu changes must be communicated at least 3 days in advance.`);
    } else if (type === "trip_ticket") {
      setTitle("Travel Booking Confirmation");
      setTerms(`• Please arrive 30 minutes before departure.
• Valid ID required for boarding.
• Luggage limit: 1 large bag + 1 carry-on per passenger.`);
    }
  }, [type, validDays]);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + laborCost + tax - discount;

  const handleSave = async () => {
    if (!customerName.trim()) {
      alert("Customer name is required");
      return;
    }

    setSaving(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      const payload = {
        type,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        title,
        description,
        notes,
        terms,
        validUntil: validUntil.toISOString(),
        items: items.filter(i => i.description.trim()),
        subtotal,
        laborCost,
        tax,
        discount,
        total,
        currency,
        tripDetails: type === "trip_ticket" ? tripDetails : undefined,
      };

      const res = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.ok && data.receipt) {
        router.push(`/admin/pos/${data.receipt.id}`);
      } else {
        alert("Failed to create receipt");
      }
    } catch (e) {
      console.error("Error:", e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/pos" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-2">
              <span className={config.color}>{config.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">New Document</p>
                <h1 className="font-display text-2xl text-slate-900 leading-none">{config.title}</h1>
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold hover:bg-emerald-600 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-display text-lg text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" /> Client Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                Client Name *
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="John Doe / Company Name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                <Phone className="w-3 h-3 inline mr-1" /> Phone
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="0243536679"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                <Mail className="w-3 h-3 inline mr-1" /> Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                <MapPin className="w-3 h-3 inline mr-1" /> Address
              </label>
              <input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Project Site, Accra"
              />
            </div>
          </div>
        </div>

        {/* Trip Details (for trip tickets) */}
        {type === "trip_ticket" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-display text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyan-500" /> Trip Details
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Origin</label>
                <input
                  value={tripDetails.origin}
                  onChange={(e) => setTripDetails({ ...tripDetails, origin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="Accra"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Destination</label>
                <input
                  value={tripDetails.destination}
                  onChange={(e) => setTripDetails({ ...tripDetails, destination: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  placeholder="Kumasi"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Vehicle Type</label>
                <select
                  value={tripDetails.vehicleType}
                  onChange={(e) => setTripDetails({ ...tripDetails, vehicleType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option>Bus</option>
                  <option>Sprinter</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Coach</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                  <Calendar className="w-3 h-3 inline mr-1" /> Departure Date
                </label>
                <input
                  type="date"
                  value={tripDetails.departureDate}
                  onChange={(e) => setTripDetails({ ...tripDetails, departureDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">
                  <Clock className="w-3 h-3 inline mr-1" /> Departure Time
                </label>
                <input
                  type="time"
                  value={tripDetails.departureTime}
                  onChange={(e) => setTripDetails({ ...tripDetails, departureTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Passengers</label>
                <input
                  type="number"
                  min="1"
                  value={tripDetails.passengers}
                  onChange={(e) => setTripDetails({ ...tripDetails, passengers: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Seat Class</label>
                <select
                  value={tripDetails.seatClass}
                  onChange={(e) => setTripDetails({ ...tripDetails, seatClass: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option>Standard</option>
                  <option>Business</option>
                  <option>VIP</option>
                  <option>Executive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-display text-lg text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> Project Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Project / Service Title"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Description / Scope</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Brief description of work scope..."
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="GHS">GHS (Ghana Cedis)</option>
                  <option value="USD">USD (US Dollars)</option>
                  <option value="EUR">EUR (Euros)</option>
                  <option value="GBP">GBP (British Pounds)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Valid For (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value) || 14)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-slate-400" /> Cost Breakdown
            </h2>
            <button
              onClick={addItem}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 w-1/2">Description</th>
                  <th className="text-center px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 w-20">Qty</th>
                  <th className="text-right px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 w-28">Unit Price</th>
                  <th className="text-right px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 w-28">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-semibold text-slate-900">
                      {currency} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">{currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {type === "construction_estimate" && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600">Labor / Workman Fee:</span>
                  <input
                    type="number"
                    min="0"
                    value={laborCost}
                    onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                    className="w-28 px-2 py-1 rounded border border-slate-200 text-sm text-right focus:outline-none focus:border-emerald-500"
                    placeholder="TBD"
                  />
                </div>
              )}
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Tax:</span>
                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2 py-1 rounded border border-slate-200 text-sm text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2 py-1 rounded border border-slate-200 text-sm text-right focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-emerald-600">{currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-display text-lg text-slate-900 mb-4">Terms & Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Terms & Conditions</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Payment terms, validity, conditions..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 block mb-1.5">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Internal notes or special instructions..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
