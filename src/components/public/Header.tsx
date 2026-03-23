'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    children: [
      { label: 'Residential', href: '/about' },
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
    <header className="fixed top-0 left-0 right-0 z-50 shadow-md" style={{ backgroundColor: '#5A695F' }}>
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-[87px]">
          {/* Logo on top left — text-based to avoid external image loading issues */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold leading-tight" style={{ color: '#FFFFFF' }}>
                Lakefront
              </span>
              <span className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase leading-tight" style={{ color: '#C9B97A' }}>
                Estates &amp; Villas
              </span>
            </div>
          </Link>

          {/* Desktop Nav — centered */}
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
                  className="px-4 py-2 text-[16px] font-body font-normal flex items-center gap-1 transition-colors duration-200"
                  style={{ color: '#E3DCD2' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#E3DCD2')}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 rounded shadow-lg py-2 animate-fade-in" style={{ backgroundColor: '#5A695F' }}>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-[13px] font-body transition-colors"
                        style={{ color: '#E3DCD2' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                        onMouseOut={(e) => (e.currentTarget.style.color = '#E3DCD2')}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Two buttons: Application + Sign In */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/apply"
              className="px-6 py-2.5 rounded text-sm font-body font-semibold tracking-wider uppercase transition-all duration-200"
              style={{ backgroundColor: '#C9B97A', color: '#FFFFFF' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b8a96a'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#C9B97A'; }}
            >
              Application
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded text-sm font-body font-semibold tracking-wider uppercase transition-all duration-200"
              style={{ backgroundColor: 'transparent', color: '#F4F0E9', border: '2px solid #F4F0E9' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F4F0E9'; e.currentTarget.style.color = '#5A695F'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F4F0E9'; }}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2"
            style={{ color: '#F4F0E9' }}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden shadow-lg animate-fade-in" style={{ backgroundColor: '#5A695F', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <nav className="section-padding py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-3 text-base font-body font-medium"
                  style={{ color: '#E3DCD2' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-2 pl-4 text-sm font-body"
                    style={{ color: '#E3DCD2' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4 space-y-2">
              <Link
                href="/apply"
                className="block w-full text-center py-2.5 rounded text-sm font-body font-semibold uppercase tracking-wider"
                style={{ backgroundColor: '#C9B97A', color: '#FFFFFF' }}
                onClick={() => setMobileOpen(false)}
              >
                Application
              </Link>
              <Link
                href="/auth/login"
                className="block w-full text-center py-2.5 rounded text-sm font-body font-semibold uppercase tracking-wider"
                style={{ border: '2px solid #F4F0E9', color: '#F4F0E9' }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
