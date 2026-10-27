import type { Metadata } from 'next';
import './globals.css';
import './sairam.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Sairam Certify | Innovation Ecosystem',
  description: 'Prepare certificate PDFs from an event template and participant spreadsheet. Approved issuers can create QR-verified credentials.',
  metadataBase: new URL('https://sairam-ecosystem-certifications.vercel.app'),
  icons: { icon: '/sairam-mark.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
