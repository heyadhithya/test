import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
export const metadata: Metadata = {title: 'Sairam Certify | Innovation Ecosystem Certifications', description: 'Prepare certificates from a PDF template and a spreadsheet.', icons: {icon: '/sairam-mark.svg'}};
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
