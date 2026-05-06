import type { Metadata } from 'next';
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
  title: 'AdmissionIQ — AI College Predictor India',
  description: 'AI-powered college predictor for Indian students. Get instant personalised college recommendations based on your marks.',
  keywords: 'college predictor India, AI admission predictor, JEE college predictor, cutoff predictor, best colleges India',
  verification: {
    google: '3FzK2uEANXU1UxcCAAfgeX8axs3N4oSq-2slO34BnCU',
  },
  alternates: {
    canonical: 'https://admissioniq-app.vercel.app',
  },
  openGraph: {
    title: 'AdmissionIQ — AI College Predictor India',
    description: 'Get AI-powered college recommendations based on your marks.',
    url: 'https://admissioniq-app.vercel.app',
    siteName: 'AdmissionIQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdmissionIQ — AI College Predictor India',
    description: 'Get AI-powered college recommendations based on your marks.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn(jakarta.variable, "min-h-screen font-sans antialiased")}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} AdmissionIQ. All rights reserved.
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
