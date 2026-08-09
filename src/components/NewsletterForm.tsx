"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function NewsletterForm({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 3000);
  };

  if (theme === "dark") {
    return (
      <form onSubmit={submit} className="flex w-full lg:w-auto gap-3">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 lg:w-80 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
        <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2">
          {done ? <><CheckCircle className="w-4 h-4" /> Subscribed</> : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
      <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
        {done ? <><CheckCircle className="w-5 h-5" /> Subscribed</> : <>Subscribe <ArrowRight className="w-5 h-5" /></>}
      </button>
    </form>
  );
}
