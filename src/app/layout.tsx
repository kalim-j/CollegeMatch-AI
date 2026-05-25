import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: 'swap',
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://collegematch-ai.vercel.app"),
  title: {
    default: "CollegeMatch-AI — AI College Predictor India",
    template: "%s | CollegeMatch-AI"
  },
  description: "Free AI-powered college predictor for Indian students. Find best engineering colleges by marks, state, cutoff and budget. Instant AI predictions for JEE, TNEA, KEAM, EAMCET and more.",
  keywords: [
    "admission ai india",
    "ai college predictor india",
    "college admission ai",
    "engineering college predictor",
    "jee college predictor ai",
    "best college for my marks india",
    "college finder india ai",
    "collegematch-ai",
    "collegematch",
    "college search ai india",
    "tnea college predictor",
    "eamcet college predictor",
    "free college predictor india",
    "ai college recommendation india"
  ],
  authors: [{ name: "CollegeMatch-AI" }],
  creator: "CollegeMatch-AI",
  publisher: "CollegeMatch-AI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://collegematch-ai.vercel.app",
    siteName: "CollegeMatch-AI",
    title: "CollegeMatch-AI — AI College Predictor India",
    description: "Find your dream college with AI. Free predictor for Indian students based on marks, state and budget.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CollegeMatch-AI College Predictor" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeMatch-AI — AI College Predictor India",
    description: "Free AI college predictor for Indian students",
    images: ["/og-image.png"]
  },
  verification: {
    google: "3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU",
    other: {
      "msvalidate.01": "71B17ABD2ACAF429A09CAD3993991A6C",
    }
  },
  alternates: {
    canonical: "https://collegematch-ai.vercel.app"
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CollegeMatch-AI"
  },
  formatDetection: {
    telephone: false
  },
  themeColor: "#7c5cfc"
};

import Footer from "@/components/Footer";
import GlobalChatWrapper from "@/components/GlobalChatWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CollegeMatch-AI",
    "url": "https://collegematch-ai.vercel.app",
    "description": "AI-powered college predictor for Indian engineering students",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "audience": {
      "@type": "Audience",
      "audienceType": "Indian students seeking engineering college admissions"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#7c5cfc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CollegeMatch-AI" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn(jakarta.variable, syne.variable, dmSans.variable, "min-h-screen bg-[#05071a] font-sans antialiased")}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(function(err) {
        console.log('SW registration failed:', err);
      });
    });
  }
`}} />

        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
          <GlobalChatWrapper />
        </Providers>
      </body>
    </html>
  );
}
