'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Our Vision', href: '/about' },
      { label: 'Commercial', href: '/commercial' },
    ],
  },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Businesses', href: '/businesses' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo — matches lakefrontestatesfl.com style */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-brand-forest leading-tight">
                Lakefront
              </span>
              <span className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold leading-tight">
                Estates &amp; Villas
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-body font-medium text-brand-text/80',
                    'hover:text-brand-forest transition-colors duration-200',
                    'flex items-center gap-1'
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-sm shadow-lg border border-gray-100 py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm font-body text-brand-text/80 hover:bg-brand-cream hover:text-brand-forest transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Single CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login" className="btn-primary text-xs">
              Sign In
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-brand-forest"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <nav className="section-padding py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-3 text-base font-body font-medium text-brand-text/80 hover:text-brand-forest"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-2 pl-4 text-sm font-body text-brand-muted hover:text-brand-forest"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4">
              <Link href="/auth/login" className="btn-primary w-full text-center text-xs" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
