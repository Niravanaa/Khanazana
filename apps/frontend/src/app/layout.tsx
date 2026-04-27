import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KhanaKhazana',
  description: 'Plan meals, store recipes, generate shopping lists.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
