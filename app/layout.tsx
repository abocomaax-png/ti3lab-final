import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ti3lab - منصة معامل اختبار الاختراق',
  description: 'أول منصة عربية متخصصة في تعليم اختبار اختراق تطبيقات الويب من خلال معامل عملية تفاعلية',
  keywords: 'اختبار اختراق, أمن معلومات, web penetration testing, ethical hacking, cybersecurity',
  authors: [{ name: 'Ti3lab Team' }],
  openGraph: {
    title: 'Ti3lab - منصة معامل اختبار الاختراق',
    description: 'أول منصة عربية متخصصة في تعليم اختبار اختراق تطبيقات الويب',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
