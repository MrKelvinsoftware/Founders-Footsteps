import { sendEmail, bookingEmailHtml, emailConfigured, smsConfigured } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, summary, total, reference } = body;

    type ChannelResult = { channel: string; ok: boolean; error?: string };
    const results: ChannelResult[] = [];

    if (email) {
      const html = bookingEmailHtml({ name: name || "there", summary: summary || "New booking", total, reference });
      const emailResult = await sendEmail({ to: email, subject: `Booking Confirmed — ${summary || "Founders & Footsteps"}`, html });
      results.push({ channel: "email", ...emailResult });
    }

    return Response.json({ ok: true, results, emailConfigured: emailConfigured(), smsConfigured: smsConfigured() });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
