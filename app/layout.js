export const metadata = {
  title: "The Truth Machine — Evolution over Superstition",
  description:
    "A sharp, funny reality check. Better metaphors, savage oxymorons, and the real story of how you got here — no stars, no omens, just evidence.",
  openGraph: {
    title: "The Truth Machine",
    description: "Sarcasm, science, and the 4-billion-year story of you.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04110f",
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
