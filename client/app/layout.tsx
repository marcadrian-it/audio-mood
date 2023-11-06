import './globals.css';
import type { Metadata } from 'next';
import { dark } from '@clerk/themes';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Audio-mood App',
  description: 'Journal your days with audio and mood tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className="bg-black">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
