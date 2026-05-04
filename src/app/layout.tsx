import type { Metadata } from 'next';
import { Inter, Raleway, JetBrains_Mono } from 'next/font/google';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700', '800', '900'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TAS System — TEXNIKA ADVANS SERVIS',
  description: 'CRM/ERP для управления продажами агро- и техоборудования',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${raleway.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
