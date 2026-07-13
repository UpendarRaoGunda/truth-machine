import "./globals.css";
import "./scientists.css";

export const metadata = {
  title: "The Truth Machine — Evolution over Superstition",
  description:
    "A sharp, funny reality check and an interactive visual atlas of life's four-billion-year history.",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
