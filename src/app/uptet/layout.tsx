import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UPTET Free Mock Test 2024 | Practice Papers Online — Prepify',
  description: 'Practice UPTET 2024 with free mock tests, previous year papers (PYQ), and subject-wise questions. Paper I & Paper II with detailed solutions. Start now on Prepify.',
  keywords: [
    'UPTET mock test',
    'UPTET free mock test 2024',
    'UPTET practice test online',
    'UPTET previous year papers',
    'UPTET paper 1 mock test',
    'UPTET paper 2 mock test',
    'UPTET CDP questions',
    'UPTET mathematics practice',
    'UPTET EVS questions',
    'Uttar Pradesh Teacher Eligibility Test',
  ],
  openGraph: {
    title: 'UPTET Free Mock Test 2024 | Prepify',
    description: 'Free UPTET mock tests with real NTA-like interface. Paper I & II, subject-wise practice, PYQs with solutions.',
    url: 'https://curioverse.in/uptet',
    siteName: 'Prepify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPTET Free Mock Test 2024 | Prepify',
    description: 'Free UPTET mock tests with real NTA-like interface. Paper I & II, subject-wise practice, PYQs with solutions.',
  },
  alternates: {
    canonical: 'https://curioverse.in/uptet',
  },
}

export default function UPTETLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
