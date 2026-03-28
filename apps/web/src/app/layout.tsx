import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LandedNZ',
  description: 'Your complete guide to landing in New Zealand',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg font-body antialiased">{children}</body>
    </html>
  );
}