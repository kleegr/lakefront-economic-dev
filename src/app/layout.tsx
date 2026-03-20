import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'Lakefront Economic Development | Okeechobee, FL', template: '%s | Lakefront Economic Development' },
  description: 'Discover jobs, businesses, commercial opportunities, and investment prospects at Lakefront Estates in Okeechobee, Florida.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
