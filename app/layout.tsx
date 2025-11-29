import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ThemeToggle } from "./components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL("https://new-pari.vercel.app");
const siteTitle = "Classement Ligue 1 | New Pari";
const siteDescription =
  "Consultez le classement Ligue 1 Uber Eats saison par saison avec statistiques complètes, mis à jour à partir des données officielles.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: siteTitle,
    template: "%s | New Pari",
  },
  description: siteDescription,
  keywords: [
    "Ligue 1",
    "classement ligue 1",
    "football",
    "uber eats",
    "statistiques",
    "positions",
  ],
  applicationName: "New Pari",
  authors: [{ name: "New Pari" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "New Pari",
    images: [
      {
        url: "/window.svg",
        width: 1200,
        height: 630,
        alt: "Classement Ligue 1 Uber Eats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/window.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/next.svg", type: "image/svg+xml" }],
    apple: [{ url: "/next.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body
        data-theme="dark"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="fixed right-4 top-4 z-50">
          {/* Client-side theme toggle */}
          <ThemeToggle />
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
