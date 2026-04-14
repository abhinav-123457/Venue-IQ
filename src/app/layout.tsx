import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VenueIQ — Smart Stadium Assistant",
    template: "%s | VenueIQ",
  },
  description:
    "Real-time crowd intelligence platform for large-scale sporting venues. Live crowd density, AI-powered navigation, and accessible wayfinding.",
  keywords: [
    "stadium",
    "venue",
    "crowd",
    "navigation",
    "accessibility",
    "real-time",
    "AI assistant",
  ],
  authors: [{ name: "VenueIQ" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "VenueIQ — Smart Stadium Assistant",
    description:
      "Real-time crowd intelligence for every seat. AI chat, live heatmaps, and accessible wayfinding.",
    type: "website",
    locale: "en_US",
    siteName: "VenueIQ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#000000] text-white font-[family-name:var(--font-inter)]" suppressHydrationWarning>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
