"use client";
import { Suspense } from "react";
import Link from "next/link";
export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Book a Service</h1>
          <p className="text-slate-600 mb-8">Choose a service to get started:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {["construction", "car-rental", "catering-events", "travel-trips", "salon-beauty", "logistics", "tech-repairs"].map((s) => (
              <Link key={s} href={`/services/${s}`} className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-lg transition capitalize font-semibold text-slate-900">{s.replace(/-/g, " ")}</Link>
            ))}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
