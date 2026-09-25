"use client";

import { useEffect, useState } from "react";
import { Mail, MessageSquare, CheckCircle2, Loader2, Info } from "lucide-react";

type ChannelResult = { channel: string; ok: boolean; error?: string };
type ApiResponse = { ok: boolean; results: ChannelResult[]; emailConfigured: boolean; smsConfigured: boolean };

export default function NotifyStatus({ email, phone }: { email?: string; phone?: string }) {
  const [state, setState] = useState<"sending" | "done">("sending");
  const [result, setResult] = useState<ApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      try {
        const raw = sessionStorage.getItem("ff_last_notify");
        if (raw) {
          const parsed = JSON.parse(raw) as ApiResponse;
          if (!cancelled) {
            setResult(parsed);
            setState("done");
          }
          return true;
        }
      } catch { /* ignore */ }
      return false;
    };

    if (check()) return;
    const id = setInterval(() => {
      if (check()) clearInterval(id);
    }, 400);
    const timeout = setTimeout(() => {
      clearInterval(id);
      if (!cancelled) setState("done");
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, []);

  if (state === "sending") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Sending confirmation…
      </div>
    );
  }

  const emailResult = result?.results.find((r) => r.channel === "email");
  const nothingConfigured = result && !result.emailConfigured && !result.smsConfigured;

  return (
    <div className="space-y-2 text-sm">
      {email && (
        <StatusRow icon={Mail} label={`Email to ${email}`} ok={!!emailResult?.ok} configured={result?.emailConfigured} />
      )}
      {phone && (
        <div className="flex items-center gap-2 text-slate-600">
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Phone: {phone}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
      )}
      {nothingConfigured && (
        <p className="flex items-start gap-1.5 text-xs text-slate-400 mt-2">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Email sending isn&apos;t connected yet — your booking is saved and visible to our team either way.
        </p>
      )}
    </div>
  );
}

function StatusRow({ icon: Icon, label, ok, configured }: { icon: React.ComponentType<{ className?: string }>; label: string; ok: boolean; configured?: boolean }) {
  if (configured === false) return null;
  return (
    <div className="flex items-center gap-2 text-slate-600">
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <span className="text-xs text-amber-600">pending</span>}
    </div>
  );
}
