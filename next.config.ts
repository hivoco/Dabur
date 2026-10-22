import type { NextConfig } from "next";

// Security headers for every response. The CSP allows only this site's own
// scripts/styles/media; 'unsafe-inline' is needed for Next's inline bootstrap
// scripts and the inlined stylesheet, and dev additionally needs 'unsafe-eval'
// for React's debugging tools.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  // The chat may call a separate backend (NEXT_PUBLIC_API_BASE_URL) in dev.
  `connect-src 'self'${process.env.NEXT_PUBLIC_API_BASE_URL ? " " + new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin : ""}${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // Allow the dev server to accept requests when the site is opened from another
  // device on the LAN (e.g. your phone) via this machine's IP address.
  // Add each host/IP you use to reach the dev server.
  allowedDevOrigins: ["192.168.1.137"],

  // Keep native / heavy RAG deps out of the bundler (run them in Node directly).
  serverExternalPackages: [
    "faiss-node",
    "@huggingface/transformers",
    "pdf-parse",
  ],

  // Allow local images to carry a query string (e.g. /discover/1.png?v=2). We
  // use ?v= to cache-bust images that keep the same filename; Next 16 blocks
  // query strings on local images unless a localPattern permits them. Omitting
  // `search` here allows any query string on any local path.
  // Inline the (small) Tailwind stylesheet into the HTML so it doesn't block
  // first render with an extra request.
  experimental: { inlineCss: true },

  images: {
    localPatterns: [{ pathname: "/**" }],
  },
};

export default nextConfig;
