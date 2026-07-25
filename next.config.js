const ancestryApi = process.env.NEXT_PUBLIC_ANCESTRY_API_URL || process.env.ANCESTRY_ENGINE_URL || "";
let ancestryOrigin = "";
try { ancestryOrigin = ancestryApi ? new URL(ancestryApi).origin : ""; } catch { ancestryOrigin = ""; }

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "upload.wikimedia.org" }] },
  async headers() {
    const connectSources = ["'self'", ancestryOrigin].filter(Boolean).join(" ");
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), browsing-topics=()" },
      { key: "Content-Security-Policy", value: ["default-src 'self'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'", "object-src 'none'", "img-src 'self' data: blob: https://upload.wikimedia.org", "font-src 'self' data:", "style-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' 'unsafe-eval'", `connect-src ${connectSources}`, "worker-src 'self' blob:", "manifest-src 'self'"].join("; ") },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

module.exports = nextConfig;
