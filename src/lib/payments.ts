// Paystack payment integration — client-side
// Set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in your .env / Vercel dashboard

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export function isPaymentsEnabled(): boolean {
  return !!PAYSTACK_PUBLIC_KEY;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

let scriptLoaded = false;
function ensureScript(): Promise<void> {
  if (scriptLoaded && window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="paystack"]')) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v2/inline.js";
    s.onload = () => { scriptLoaded = true; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export function pay(opts: {
  amountGHS: number;
  email: string;
  name?: string;
  onSuccess: (reference: string) => void | Promise<void>;
}) {
  if (!isPaymentsEnabled()) {
    // Fallback — no Paystack configured, just succeed with a manual ref
    const ref = `manual_${Date.now().toString(36)}`;
    opts.onSuccess(ref);
    return;
  }

  ensureScript()
    .then(() => {
      if (!window.PaystackPop) {
        opts.onSuccess(`fallback_${Date.now().toString(36)}`);
        return;
      }
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: opts.email,
        amount: Math.round(opts.amountGHS * 100), // pesewas
        currency: "GHS",
        metadata: { custom_fields: [{ display_name: "Customer", variable_name: "customer", value: opts.name || opts.email }] },
        callback: (response: { reference: string }) => {
          opts.onSuccess(response.reference);
        },
        onClose: () => {
          // user closed — do nothing
        },
      });
      handler.openIframe();
    })
    .catch(() => {
      opts.onSuccess(`offline_${Date.now().toString(36)}`);
    });
}
