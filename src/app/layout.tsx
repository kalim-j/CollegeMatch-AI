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
    default: 'AdmissionIQ — AI College Predictor India',
    template: '%s | AdmissionIQ',
  },
  description: 'AI-powered college predictor for Indian students. Get instant personalised college recommendations based on your marks.',
  keywords: [
    'college predictor India',
    'AI admission predictor',
    'JEE college predictor',
    'NEET college predictor',
    'cutoff predictor',
    'best colleges India',
    'NIT predictor',
    'IIT predictor',
    'college recommendations',
    'AdmissionIQ',
  ],
  authors: [{ name: 'AdmissionIQ Team' }],
  creator: 'AdmissionIQ',
  publisher: 'AdmissionIQ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AdmissionIQ',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  metadataBase: new URL('https://admissioniq-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://admissioniq-app.vercel.app',
    title: 'AdmissionIQ — AI College Predictor India',
    description: 'Get AI-powered college recommendations based on your marks.',
    siteName: 'AdmissionIQ',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'AdmissionIQ',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'AdmissionIQ — AI College Predictor India',
    description: 'Get AI-powered college recommendations based on your marks.',
    images: ['/icons/icon-512x512.png'],
  },
  verification: {
    google: '3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icons/icon-192x192.png'],
  },
};


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
        <meta name="application-name" content="AdmissionIQ" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AdmissionIQ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icons/icon-96x96.png" />
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
          <InstallPrompt />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}

