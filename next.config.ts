import type { NextConfig } from "next";

/**
 * Baseline security headers, applied to every response.
 *
 * Deliberately NOT a full Content-Security-Policy: Next injects inline
 * bootstrap scripts and the themes rely on inline styles, so a real CSP needs
 * per-request nonces and is its own piece of work. The one CSP directive here
 * (`frame-ancestors`) is safe to ship standalone and is the part that actually
 * prevents clickjacking of the admin dashboard.
 *
 * `frame-ancestors 'self'` — NOT `'none'`: the landing page's theme gallery
 * embeds /demo/[themeId] in a same-origin <iframe> (components/landing/
 * theme-card.tsx), which `'none'`/`DENY` would break. Same reason
 * X-Frame-Options is SAMEORIGIN.
 */
const securityHeaders = [
  // Force HTTPS for two years, including subdomains. Safe here because the app
  // is HTTPS-only in production; localhost is exempt (HSTS ignores it).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // Send the origin cross-site, the full path same-site. Keeps invite tokens in
  // the path from leaking to third parties via the Referer header.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // `payment` is allowed for this origin and Razorpay's checkout, and nothing
  // else. It was previously `payment=()`, which disables the Payment Request
  // API outright — that silently costs the self-serve checkout its Google Pay
  // option on Chrome, since Razorpay reaches for that API from the iframe it
  // opens. The remaining capabilities stay switched off everywhere.
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com" "https://api.razorpay.com")',
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't infer it from a stray lockfile
  // higher up the filesystem (e.g. ~/package-lock.json).
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
