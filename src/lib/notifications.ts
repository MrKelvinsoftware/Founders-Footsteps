import "server-only";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || "Founders & Footsteps <onboarding@resend.dev>";
const resend = resendKey ? new Resend(resendKey) : null;

export function emailConfigured(): boolean {
  return !!resendKey;
}
export function smsConfigured(): boolean {
  return false;
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.log(`[notify] (email disabled — set RESEND_API_KEY) would send to ${opts.to}: ${opts.subject}`);
    return { ok: false, error: "Email not configured" };
  }
  try {
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown email error" };
  }
}

export function bookingEmailHtml(opts: { name: string; summary: string; total?: number; reference?: string }): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc">
    <div style="background:#0f172a;border-radius:16px 16px 0 0;padding:24px 28px;">
      <p style="color:#fbbf24;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Founders &amp; Footsteps</p>
      <h1 style="color:#fff;font-size:22px;margin:0;">Booking confirmed</h1>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px;border:1px solid #e2e8f0;border-top:none;">
      <p style="color:#0f172a;font-size:15px;">Hi ${opts.name || "there"},</p>
      <p style="color:#334155;font-size:14px;line-height:1.6;">Thank you — we've received your request and it's now confirmed:</p>
      <div style="background:#f1f5f9;border-radius:10px;padding:16px 18px;margin:16px 0;">
        <p style="margin:0;color:#0f172a;font-size:14px;">${opts.summary}</p>
        ${opts.total ? `<p style="margin:8px 0 0;color:#2563eb;font-size:18px;font-weight:700;">GH₵${opts.total.toLocaleString()}</p>` : ""}
      </div>
      ${opts.reference ? `<p style="color:#64748b;font-size:12px;">Reference: ${opts.reference}</p>` : ""}
      <p style="color:#334155;font-size:14px;line-height:1.6;">Our team will be in touch shortly. You can reach us any time at <a href="mailto:phrimpongkelvin@gmail.com" style="color:#2563eb;">phrimpongkelvin@gmail.com</a> or call 0261404904.</p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Founders &amp; Footsteps · Apex Lifestyle Syndicate</p>
    </div>
  </div>`;
}

export function bookingSmsText(opts: { summary: string; total?: number }): string {
  const money = opts.total ? ` Total: GHS ${opts.total.toLocaleString()}.` : "";
  return `Founders & Footsteps: Your booking is confirmed — ${opts.summary}.${money} Thank you for choosing us!`;
}
