import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";
import { Providers } from "@/components/Providers";
import OnboardingGuide from "@/components/OnboardingGuide";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoyagrIQ - Smart Travel Analytics",
  description: "Intelligent travel analytics and reporting platform for modern travel agencies. Track trips, analyze costs, and grow your business.",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Providers>
          <ClientNavigation />
          <main id="main-content" className="min-h-screen bg-gray-50">
            {children}
          </main>
          <OnboardingGuide />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
