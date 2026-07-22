import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Theo | Cybersecurity Writeups & Lab Solutions',
  description: 'Documenting CTF challenges, TryHackMe labs, DVWA vulnerabilities, and cybersecurity research.',
  keywords: ['cybersecurity', 'writeups', 'tryhackme', 'dvwa', 'ctf', 'penetration testing', 'web security'],
  authors: [{ name: 'Theo' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cyber-bg text-gray-200 cyber-grid purple-glow-bg flex flex-col antialiased selection:bg-brand-600 selection:text-white">
        <Navbar />
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
