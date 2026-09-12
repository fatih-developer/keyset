import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { en } from "@/content/i18n/en";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: en.meta.title, template: "%s | Onset" },
  description: en.meta.description,
  applicationName: "Onset",
  openGraph: { siteName: "Onset", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Onset",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/onset.svg`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The inline script adds `js` before first paint, so scroll reveals never flash; hence suppressHydrationWarning.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
        <RevealObserver />
      </body>
    </html>
  );
}
