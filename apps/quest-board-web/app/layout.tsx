import type { Metadata } from "next";
import { Cormorant_Garamond, Almendra, Cinzel, Lora } from 'next/font/google';
import AuthLayout from './components/AuthLayout';
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

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cinzel',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: "Quest Board",
  description: "A medieval RPG quest board application",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${almendra.variable} ${cinzel.variable} ${lora.variable}`}>
      <body>
        <AuthLayout>
          {children}
        </AuthLayout>
      </body>
    </html>
  );
}
