import type { Metadata } from "next";
import { Cormorant_Garamond, Almendra } from 'next/font/google';
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

const almendra = Almendra({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-almendra',
});

export const metadata: Metadata = {
  title: "Quest Board",
  description: "A medieval RPG quest board application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${almendra.variable}`}>
      <body>{children}</body>
    </html>
  );
}
