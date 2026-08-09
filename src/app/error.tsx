"use client";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#fafaf7]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5"><AlertTriangle className="w-7 h-7" /></div>
        <h1 className="font-display text-2xl text-slate-900 mb-3">Something went wrong</h1>
        <p className="text-slate-600 text-sm mb-6">Try again or head home.</p>
        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 px-4 py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Try again</button>
          <a href="/" className="flex-1 px-4 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"><Home className="w-4 h-4" /> Home</a>
        </div>
        {error.digest && <p className="mt-5 text-[11px] font-mono text-slate-400">ref {error.digest}</p>}
      </div>
    </div>
  );
}
