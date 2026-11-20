import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'FocusTube - Distraction-Free YouTube (Zero Reels, No Ads)',
  description: 'Search YouTube without Shorts, Reels, or Ads. Curate custom profiles & folders for Education, Meditation, and Focused Learning.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FocusTube',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0f0f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#0f0f0f] text-[#f1f1f1] min-h-[100dvh] flex flex-col antialiased selection:bg-red-600 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
