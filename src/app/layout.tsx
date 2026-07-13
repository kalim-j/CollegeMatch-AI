import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import GlobalChatWrapper from "@/components/GlobalChatWrapper";
import InstallPrompt from "@/components/InstallPrompt";
import BottomNav from "@/components/BottomNav";
import PageCanvas3D from "@/components/PageCanvas3D";
import WhatsAppWidget from "@/components/WhatsAppWidget";

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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: 'CollegeMatch AI — AI College Predictor India',
    template: '%s | CollegeMatch AI',
  },
  description: 'AI-powered college predictor for Indian students. Get instant personalised college recommendations based on your marks.',
  keywords: [
    'college predictor India',
    'CollegeMatch AI',
    'AI admission predictor',
    'JEE college predictor',
    'NEET college predictor',
    'NIT predictor',
    'IIT predictor',
    'best colleges India',
    'cutoff predictor 2026',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CollegeMatch AI',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/icon-152x152.svg', sizes: '152x152' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192' },
    ],
  },
  verification: {
    google: '3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU',
  },
  metadataBase: new URL('https://your-vercel-url.vercel.app'),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CollegeMatch AI",
    "url": "https://your-vercel-url.vercel.app",
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
    <html
      lang="en"
      suppressHydrationWarning
      style={{ backgroundColor: '#05071a' }}
    >
      <head>
        <meta name="application-name" content="CollegeMatch AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CollegeMatch AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6d28d9" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.svg" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icons/icon-96x96.svg" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/themify-icons@1.0.1/css/themify-icons.css" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: 'transparent',
          minHeight: '100vh',
        }}
      >
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
          <InstallPrompt />
          <WhatsAppWidget />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

