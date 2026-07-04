import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Future Time Capsule — Dispatches From Your Tomorrow",
  description:
    "Write your name, plant your dream, and let AI write you a vintage newspaper front page from a future that hasn't happened yet.",
  keywords: [
    "time capsule",
    "future newspaper",
    "AI newspaper",
    "hackathon",
    "GLM",
    "CogView",
  ],
  openGraph: {
    title: "The Future Time Capsule",
    description:
      "AI-generated vintage newspaper front pages from your future.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Special+Elite&family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=UnifrakturMaguntia&family=MedievalSharp&family=IM+Fell+English+SC&family=IM+Fell+English:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Prata&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col paper-bg">{children}</body>
    </html>
  );
}
