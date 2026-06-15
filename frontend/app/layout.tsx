import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Assumed standard Next.js setup with Tailwind directives

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Enterprise SaaS E-Commerce Engine',
  description: 'Scalable cloud commerce architecture built for speed and reliability.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className={`${inter.variable} font-sans min-h-full flex flex-col`}>
        {/* Main application wrapper to support structural modular layout designs */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <span className="font-bold text-xl tracking-tight text-indigo-600">SaaSCommerce</span>
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="/products" className="hover:text-indigo-600 transition">Products</a>
              <a href="/cart" className="hover:text-indigo-600 transition">Cart</a>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="w-full border-t border-slate-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} SaaSCommerce Engine. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}