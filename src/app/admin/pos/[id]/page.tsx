"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Printer, Download, Edit3, Trash2, CheckCircle,
  Building2, Plane, PartyPopper, Wrench, FileText, Clock, XCircle,
  Mail, Phone, MapPin, RefreshCw
} from "lucide-react";
import { adminFetch } from "@/lib/adminFetch";

type Receipt = {
  id: string;
  receiptNumber: string;
  type: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  title: string | null;
  description: string | null;
  notes: string | null;
  terms: string | null;
  validUntil: string | null;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number; section?: string }> | null;
  subtotal: string | null;
  laborCost: string | null;
  tax: string | null;
  discount: string | null;
  total: string;
  currency: string;
  amountPaid: string | null;
  tripDetails: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    departureTime?: string;
    passengers?: number;
    seatClass?: string;
    vehicleType?: string;
  } | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  construction_estimate: { label: "Construction Estimate", icon: <Building2 className="w-5 h-5" />, color: "text-slate-600", bgColor: "bg-slate-600" },
  trip_ticket: { label: "Trip Ticket", icon: <Plane className="w-5 h-5" />, color: "text-cyan-600", bgColor: "bg-cyan-600" },
  event_receipt: { label: "Event Receipt", icon: <PartyPopper className="w-5 h-5" />, color: "text-amber-600", bgColor: "bg-amber-600" },
  service_receipt: { label: "Service Receipt", icon: <Wrench className="w-5 h-5" />, color: "text-purple-600", bgColor: "bg-purple-600" },
};

export default function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadReceipt = useCallback(async () => {
    try {
      const res = await adminFetch(`/api/admin/pos/${id}`);
      const data = await res.json();
      if (data.ok) setReceipt(data.receipt);
    } catch (e) {
      console.error("Failed to load receipt:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReceipt();
  }, [loadReceipt]);

  const updateStatus = async (newStatus: string) => {
    if (!receipt) return;
    setUpdating(true);
    try {
      const res = await adminFetch(`/api/admin/pos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) setReceipt(data.receipt);
    } catch (e) {
      console.error("Failed to update:", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this receipt? This cannot be undone.")) return;
    try {
      await adminFetch(`/api/admin/pos/${id}`, { method: "DELETE" });
      router.push("/admin/pos");
    } catch (e) {
      console.error("Failed to delete:", e);
    }
  };

  const handleSendEmail = async () => {
    if (!receipt?.customerEmail) {
      alert("No customer email address");
      return;
    }
    // In a real app, this would send an email
    alert(`Email would be sent to: ${receipt.customerEmail}`);
    await updateStatus("sent");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Receipt not found</h2>
          <Link href="/admin/pos" className="text-emerald-600 hover:underline mt-2 inline-block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const config = typeConfig[receipt.type] || typeConfig.service_receipt;
  const subtotal = parseFloat(receipt.subtotal || "0");
  const laborCost = parseFloat(receipt.laborCost || "0");
  const tax = parseFloat(receipt.tax || "0");
  const discount = parseFloat(receipt.discount || "0");
  const total = parseFloat(receipt.total);

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/pos" className="p-2 rounded-lg hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-600 font-semibold">
                {config.label}
              </p>
              <h1 className="font-display text-2xl text-slate-900 leading-none font-mono">
                {receipt.receiptNumber}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {updating && <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />}
            
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
              receipt.status === "paid" ? "bg-emerald-100 text-emerald-700" :
              receipt.status === "sent" ? "bg-blue-100 text-blue-700" :
              receipt.status === "cancelled" ? "bg-red-100 text-red-700" :
              "bg-slate-100 text-slate-700"
            }`}>
              {receipt.status}
            </span>

            <Link
              href={`/admin/pos/${id}/print`}
              target="_blank"
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </Link>
            
            <button
              onClick={handleSendEmail}
              className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>

            {receipt.status !== "paid" && (
              <button
                onClick={() => updateStatus("paid")}
                className="px-4 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Mark Paid
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {/* Receipt Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`${config.bgColor} text-white p-6`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {config.icon}
                  <span className="text-sm font-semibold uppercase tracking-wider opacity-80">{config.label}</span>
                </div>
                <h2 className="text-2xl font-bold">FOUNDERS & FOOTSTEPS</h2>
                <p className="text-sm opacity-80">JUSFO CONSTRUCTION</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold">{receipt.receiptNumber}</p>
                <p className="text-sm opacity-80">
                  {new Date(receipt.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
                {receipt.validUntil && (
                  <p className="text-xs opacity-70 mt-1">
                    Valid until: {new Date(receipt.validUntil).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Client Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-slate-900">{receipt.customerName || "—"}</p>
                {receipt.customerPhone && (
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {receipt.customerPhone}
                  </p>
                )}
                {receipt.customerEmail && (
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {receipt.customerEmail}
                  </p>
                )}
              </div>
              {receipt.customerAddress && (
                <div>
                  <p className="text-sm text-slate-600 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5" /> {receipt.customerAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          {(receipt.title || receipt.description) && (
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Project Details</h3>
              {receipt.title && <h4 className="font-semibold text-slate-900 mb-2">{receipt.title}</h4>}
              {receipt.description && <p className="text-sm text-slate-600">{receipt.description}</p>}
            </div>
          )}

          {/* Trip Details */}
          {receipt.type === "trip_ticket" && receipt.tripDetails && (
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-cyan-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{receipt.tripDetails.origin || "—"}</p>
                  <p className="text-xs text-slate-500 uppercase">Origin</p>
                </div>
                <div className="flex-1 mx-8 relative">
                  <div className="border-t-2 border-dashed border-cyan-400"></div>
                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-600 rotate-90" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{receipt.tripDetails.destination || "—"}</p>
                  <p className="text-xs text-slate-500 uppercase">Destination</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6 text-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Date</p>
                  <p className="font-semibold">{receipt.tripDetails.departureDate || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Time</p>
                  <p className="font-semibold">{receipt.tripDetails.departureTime || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Passengers</p>
                  <p className="font-semibold">{receipt.tripDetails.passengers || 1}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Class</p>
                  <p className="font-semibold">{receipt.tripDetails.seatClass || "Standard"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Line Items */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Cost Breakdown</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 text-xs font-semibold uppercase text-slate-500">#</th>
                    <th className="text-left py-2 text-xs font-semibold uppercase text-slate-500">Description</th>
                    <th className="text-center py-2 text-xs font-semibold uppercase text-slate-500">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold uppercase text-slate-500">Unit Price</th>
                    <th className="text-right py-2 text-xs font-semibold uppercase text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2 text-sm text-slate-500">{idx + 1}</td>
                      <td className="py-2 text-sm text-slate-900">{item.description}</td>
                      <td className="py-2 text-sm text-slate-700 text-center">{item.quantity}</td>
                      <td className="py-2 text-sm text-slate-700 text-right">
                        {receipt.currency} {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-sm font-semibold text-slate-900 text-right">
                        {receipt.currency} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="p-6 bg-slate-50">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">{receipt.currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {laborCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Labor / Workman Fee:</span>
                  <span>{receipt.currency} {laborCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax:</span>
                  <span>{receipt.currency} {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount:</span>
                  <span className="text-red-600">-{receipt.currency} {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span className="text-emerald-600">{receipt.currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          {receipt.terms && (
            <div className="p-6 border-t border-slate-200 text-sm text-slate-600">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Terms & Conditions</h3>
              <p className="whitespace-pre-wrap">{receipt.terms}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 font-semibold hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          {receipt.status !== "cancelled" && receipt.status !== "paid" && (
            <button
              onClick={() => updateStatus("cancelled")}
              className="px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
