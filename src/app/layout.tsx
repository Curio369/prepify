import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Prepify — Free UPTET & CTET Mock Tests | NTA Interface",
  description: "Free mock tests for UPTET and CTET with real NTA-like interface. Practice with previous year papers, subject-wise questions and AI explanations. Start for free.",
  keywords: [
    'UPTET mock test', 'CTET mock test', 'UPTET free practice test',
    'CTET free practice test', 'teacher eligibility test', 'NTA mock test',
    'UPTET 2024', 'CTET 2024', 'TET practice papers',
  ],
  icons: {
    icon: [
      { url: '/Logos/logo-icon_dark-Photoroom.png', type: 'image/png' },
    ],
    apple: '/Logos/logo-icon_dark-Photoroom.png',
  },
  openGraph: {
    title: 'Prepify — Free UPTET & CTET Mock Tests',
    description: 'Free mock tests for UPTET and CTET with real NTA-like interface. Practice with PYQs and AI explanations.',
    url: 'https://curioverse.in',
    siteName: 'Prepify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prepify — Free UPTET & CTET Mock Tests',
    description: 'Free mock tests for UPTET and CTET with real NTA-like interface.',
  },
  alternates: {
    canonical: 'https://curioverse.in',
  },
  other: {
    'google-adsense-account': 'ca-pub-3612987200657403',
    'google-site-verification': 'vF8d4nNv4qJe3E_Kt46YhoBVmvKjxvqweNBVq5_aCB8',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
