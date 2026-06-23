import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UPTET Free Mock Test & PYQ 2026 | Prepify',
  description: 'Free UPTET mock tests — all subjects, previous year papers (PYQ), Paper I & II practice. Child Development, Hindi, English, Maths, EVS. Start free on Prepify.',
  keywords: [
    'UPTET mock test',
    'UPTET free mock test 2026',
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
    title: 'UPTET Free Mock Test & PYQ 2026 | Prepify',
    description: 'Free UPTET mock tests — all subjects, previous year papers (PYQ), Paper I & II. Child Development, Hindi, Maths, EVS. 100% free on Prepify.',
    url: 'https://curioverse.in/uptet',
    siteName: 'Prepify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPTET Free Mock Test & PYQ 2026 | Prepify',
    description: 'Free UPTET mock tests — all subjects, previous year papers (PYQ), Paper I & II. 100% free on Prepify.',
  },
  alternates: {
    canonical: 'https://curioverse.in/uptet',
  },
}

export default function UPTETLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
