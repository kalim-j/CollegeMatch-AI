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
  title: 'EduAnalytics-AI | Your Dream College Awaits',
  description: 'AI-powered education analytics to help Indian students find their dream college based on marks, stream, and interests.',
  keywords: 'EduAnalytics AI, college predictor India, AI college finder, Tamil Nadu college, CBSE college match, education analytics',
  openGraph: {
    title: 'EduAnalytics-AI | Your Dream College Awaits',
    description: 'Find your perfect college match using AI. Supports CBSE, ICSE, and State Board students.',
    url: 'https://eduanalytics-ai.vercel.app',
    siteName: 'EduAnalytics-AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduAnalytics-AI | Your Dream College Awaits',
    description: 'AI-powered college finder for Indian students.',
  },
  metadataBase: new URL('https://eduanalytics-ai.vercel.app'),
  alternates: {
    canonical: 'https://eduanalytics-ai.vercel.app',
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
                  &copy; {new Date().getFullYear()} EduAnalytics-AI. All rights reserved.
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
