'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Businesses', href: '/businesses' },
  { label: 'Services', href: '/services' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'About', href: '/about' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Contact', href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-brand-forest leading-tight">Lakefront</span>
              <span className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold leading-tight">Economic Development</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="px-4 py-2 text-sm font-body font-medium text-brand-text/80 hover:text-brand-forest transition-colors duration-200">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login" className="btn-primary text-xs">Sign In</Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-brand-forest" aria-label="Toggle navigation">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <nav className="section-padding py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="block py-3 text-base font-body font-medium text-brand-text/80 hover:text-brand-forest" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="pt-4">
              <Link href="/auth/login" className="btn-primary w-full text-center text-xs" onClick={() => setMobileOpen(false)}>Sign In</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
