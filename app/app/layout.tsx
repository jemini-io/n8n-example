import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Form',
  description: 'A simple contact form that submits to a webhook',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 