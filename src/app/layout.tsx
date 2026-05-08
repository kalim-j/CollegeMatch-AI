import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://collegematch-ai.vercel.app"),
  title: {
    default: "CollegeMatch — AI College Predictor India",
    template: "%s | CollegeMatch"
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
    "collegematch",
    "admission iq",
    "admissioniq",
    "college search ai india",
    "tnea college predictor",
    "eamcet college predictor",
    "free college predictor india",
    "ai college recommendation india"
  ],
  authors: [{ name: "CollegeMatch" }],
  creator: "CollegeMatch",
  publisher: "CollegeMatch",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://collegematch-ai.vercel.app",
    siteName: "CollegeMatch",
    title: "CollegeMatch — AI College Predictor India",
    description: "Find your dream college with AI. Free predictor for Indian students based on marks, state and budget.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CollegeMatch AI College Predictor" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeMatch — AI College Predictor India",
    description: "Free AI college predictor for Indian students",
    images: ["/og-image.png"]
  },
  verification: {
    google: "3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU",
    yandex: "ADD_YOUR_YANDEX_CODE_HERE"
  },
  alternates: {
    canonical: "https://collegematch-ai.vercel.app"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CollegeMatch",
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
      <body className={cn(jakarta.variable, "min-h-screen font-sans antialiased")}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Providers>

          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} CollegeMatch. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Inspiring ambition since 2024</span>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
