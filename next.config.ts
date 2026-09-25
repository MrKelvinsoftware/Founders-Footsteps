import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Images ────────────────────────────────────────────────────────────────
  // Allow next/image to serve optimised images from these external hosts.
  images: {
    remotePatterns: [
      // Unsplash (used in hero & service cards)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Cloudinary (if used for product/branding uploads)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Generic fallback for any user-uploaded images stored in a CDN bucket
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },

  // ── Security headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Stop leaking referrer details to third-party sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable DNS prefetch to reduce information leakage
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Permissions policy — restrict powerful browser features
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(self), usb=()",
          },
          // Content-Security-Policy (relaxed for Next.js inline scripts + Paystack)
          // Tighten further once you audit every third-party script.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs unsafe-inline/eval for its runtime; narrow this once you add a nonce
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://res.cloudinary.com https://*.amazonaws.com https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://api.paystack.co https://resend.com",
              "frame-src https://js.paystack.co",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // HSTS — only sent in production; 1-year max-age
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
      // Note: /_next/static caching is managed by Next.js/Vercel automatically.
      // Do not override it here — doing so triggers a Next.js build warning.
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Legacy paths → current equivalents (add more as needed)
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signup",
        permanent: true,
      },
    ];
  },

  // ── Build options ─────────────────────────────────────────────────────────
  // Treat TypeScript errors as hard failures in CI / Vercel builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint: use ignoreDuringBuilds at the top level (Next 16 API)
  // eslint: { ignoreDuringBuilds: false } was removed in Next 16 — linting is
  // now controlled by the eslint config file directly.

  // Reduce the edge bundle size — server-only pg code must not ship to the browser
  serverExternalPackages: ["pg", "bcryptjs"],
};

export default nextConfig;
