import "./globals.css";
import "./scientists.css";

export const metadata = {
  title: "The Truth Machine — Evidence, Evolution and Ancestral Journeys",
  description:
    "A sharp reality check, an interactive visual atlas of life, and a privacy-first evidence-labelled journey through human population history.",
  openGraph: {
    title: "The Truth Machine",
    description: "Evidence, evolution, and the stranger true story of how life produced us.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#03110f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <a href="/ancestry" aria-label="Open Ancestral Journey" style={{ position: "fixed", right: "16px", bottom: "16px", zIndex: 90, display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid rgba(79,240,196,.36)", borderRadius: "999px", padding: "10px 14px", color: "#edfff8", background: "rgba(3,17,15,.88)", boxShadow: "0 14px 44px rgba(0,0,0,.34), 0 0 24px rgba(79,240,196,.12)", backdropFilter: "blur(14px)", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 600, textDecoration: "none", letterSpacing: ".04em" }}>
          <span style={{ color: "#4ff0c4" }}>DNA</span> Ancestral Journey
        </a>
      </body>
    </html>
  );
}
