import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CTET Free Mock Test 2024 | Practice Papers Online — Prepify',
  description: 'Practice CTET 2024 with free mock tests, previous year papers (PYQ), and subject-wise questions. Paper I & Paper II with detailed solutions. Start now on Prepify.',
  keywords: [
    'CTET mock test',
    'CTET free mock test 2024',
    'CTET practice test online',
    'CTET previous year papers',
    'CTET paper 1 mock test',
    'CTET paper 2 mock test',
    'CTET CDP questions',
    'CTET mathematics practice',
    'CTET EVS questions',
    'Central Teacher Eligibility Test',
  ],
  openGraph: {
    title: 'CTET Free Mock Test 2024 | Prepify',
    description: 'Free CTET mock tests with real NTA-like interface. Paper I & II, subject-wise practice, PYQs with solutions.',
    url: 'https://curioverse.in/ctet',
    siteName: 'Prepify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CTET Free Mock Test 2024 | Prepify',
    description: 'Free CTET mock tests with real NTA-like interface. Paper I & II, subject-wise practice, PYQs with solutions.',
  },
  alternates: {
    canonical: 'https://curioverse.in/ctet',
  },
}

export default function CTETLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
