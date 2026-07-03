import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import '@/styles/globals.css';

// ─── Fonts ────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Nexora — Shift Scheduling',
    template: '%s · Nexora',
  },
  description:
    'Nexora is a modern shift-scheduling platform for teams. Manage schedules, track attendance, handle time-off, and stay in sync — all in one place.',
  keywords: ['shift scheduling', 'workforce management', 'employee scheduling', 'nexora'],
  authors: [{ name: 'Nexora' }],
  metadataBase: new URL('https://nexora.app'),
  openGraph: {
    type: 'website',
    siteName: 'Nexora',
    title: 'Nexora — Shift Scheduling',
    description: 'Modern shift scheduling for modern teams.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F4' },
    { media: '(prefers-color-scheme: dark)', color: '#16151A' },
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
