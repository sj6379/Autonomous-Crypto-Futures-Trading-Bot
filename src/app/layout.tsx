import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { BackgroundAnimation } from "@/components/ui/BackgroundAnimation";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trading Bot | Gemini Powered',
  description: 'Autonomous AI Trading with Glassmorphism UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <BackgroundAnimation />
        {children}
      </body>
    </html>
  );
}
