"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, CreditCard, CheckCircle2, Shield, MapPin, Truck, LogIn } from "lucide-react";
import { addSubmission } from "@/lib/submissions";
import { pay } from "@/lib/payments";
import { useAuth } from "@/components/AuthProvider";

type CartItem = { id: string; name: string; slug: string; price: number; quantity: number; image: string };

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Northern", "Volta", "Upper East", "Upper West", "Bono",
  "Bono East", "Ahafo", "Savannah", "North East", "Oti",
  "Western North",
];

const SHIPPING_RATES: Record<string, number> = {
  "Greater Accra": 0, "Ashanti": 45, "Western": 60, "Eastern": 40, "Central": 35,
  "Northern": 80, "Volta": 55, "Upper East": 90, "Upper West": 95,
  "Bono": 65, "Bono East": 70, "Ahafo": 60, "Savannah": 85,
  "North East": 90, "Oti": 60, "Western North": 65,
};

const DEFAULT_FREE_DELIVERY_THRESHOLD = 500;

export default function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ordered, setOrdered] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("Greater Accra");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paying, setPaying] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState(DEFAULT_FREE_DELIVERY_THRESHOLD);

  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("ff_cart") || "[]")); } catch { setItems([]); } }, []);
  useEffect(() => { localStorage.setItem("ff_cart", JSON.stringify(items)); }, [items]);
  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { if (d.freeDeliveryThreshold) setFreeThreshold(d.freeDeliveryThreshold); })
      .catch(() => {});
  }, []);

  const updateQty = (id: string, delta: number) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= freeThreshold ? 0 : (SHIPPING_RATES[deliveryRegion] || 35);
  const total = subtotal + shipping;

  const handlePay = () => {
    if (!user) return;
    if (!deliveryAddress.trim()) { alert("Please enter a delivery address"); return; }
    setPaying(true);
    const email = user.email;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    pay({ amountGHS: total, email, name, onSuccess: async (reference) => {
      const result = await addSubmission({
        type: "marketplace", total, currency: "GHS",
        customer: { firstName: user.firstName || "Guest", lastName: user.lastName || "", email, phone: "" },
        summary: `${items.reduce((s, i) => s + i.quantity, 0)} item(s)`,
        payload: {
          items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
          subtotal, shipping, total, reference,
          delivery: { region: deliveryRegion, address: deliveryAddress },
        }
      });
      setTrackingNumber((result as Record<string, unknown>)?.trackingNumber as string || "");
      setItems([]); localStorage.removeItem("ff_cart"); setOrdered(true); setPaying(false);
    }});
  };

  if (ordered) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
        <h2 className="font-display text-3xl text-slate-900 mb-3">Order Confirmed! 🎉</h2>
        {trackingNumber && (
          <div className="bg-slate-50 rounded-xl px-6 py-4 mb-4">
            <p className="text-sm text-slate-600 mb-1">Your Order Number:</p>
            <p className="text-2xl font-bold text-slate-900 tracking-wider">{trackingNumber}</p>
          </div>
        )}
        <p className="text-slate-600 mb-6">Receipt and tracking details have been sent to your inbox and email.</p>
        <Link href="/marketplace" className="btn-primary px-6 py-3 inline-flex items-center gap-2">Continue shopping <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl shadow-sm p-12 max-w-lg mx-auto">
          <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h2 className="font-display text-3xl text-slate-900 mb-3">Your cart is empty</h2>
          <Link href="/marketplace" className="btn-primary px-6 py-3 inline-flex items-center gap-2">Browse marketplace <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-4xl text-slate-900 mb-8">Your cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4 border border-slate-200/70">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                  <p className="text-orange-600 font-bold mt-1">GH₵{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 border border-slate-200 rounded-lg">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => remove(item.id)} className="text-red-600 text-sm hover:underline flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                  </div>
                </div>
                <p className="font-display text-lg text-slate-900">GH₵{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/70 sticky top-24">
              <h3 className="font-display text-xl text-slate-900 mb-4">Order summary</h3>
              
              {/* Delivery Region */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4" /> Delivery Region
                </label>
                <select value={deliveryRegion} onChange={(e) => setDeliveryRegion(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm">
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r} {SHIPPING_RATES[r] === 0 ? "(Free)" : `(GH₵${SHIPPING_RATES[r]})`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 text-sm pb-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-600"><span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span><span>GH₵{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : `GH₵${shipping}`}</span>
                </div>
                {subtotal >= freeThreshold && shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 Free delivery on orders above GH₵{freeThreshold.toLocaleString()}!</p>
                )}
                {subtotal < freeThreshold && (
                  <p className="text-xs text-slate-500">Add GH₵{(freeThreshold - subtotal).toLocaleString()} more for free delivery</p>
                )}
              </div>
              <div className="flex justify-between items-center py-4"><span className="font-semibold">Total</span><span className="font-display text-2xl text-slate-900">GH₵{total.toLocaleString()}</span></div>
              
              {user ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-blue-900">👤 {user.firstName} {user.lastName}</p>
                    <p className="text-blue-700 text-xs">{user.email}</p>
                  </div>
                  <input required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Delivery address" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm" />
                  <button onClick={handlePay} disabled={paying || !deliveryAddress.trim()} className="w-full py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {paying ? "Processing…" : `Pay GH₵${total.toLocaleString()}`}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 text-center">Sign in to checkout — no forms needed!</p>
                  <Link href="/auth/signin" className="w-full py-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" /> Sign in to checkout
                  </Link>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Shield className="w-3.5 h-3.5" /> Secure Paystack checkout · MoMo · Card · Bank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
