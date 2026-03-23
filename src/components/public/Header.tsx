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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo — top left, matching lakefrontestatesfl.com serif style */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="flex flex-col">
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#4A5A4F', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                Lakefront
              </span>
              <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#8A8A7A', lineHeight: 1 }}>
                Estates &amp; Villas
              </span>
            </div>
          </Link>

          {/* Desktop Nav — right-aligned with button */}
          <div className="hidden lg:flex items-center gap-1">
            <nav className="flex items-center gap-0">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-2 text-[15px] font-body font-normal flex items-center gap-1 transition-colors duration-200 text-gray-700 hover:text-gray-900"
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                  </Link>
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded shadow-lg border border-gray-100 py-2 animate-fade-in z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-[13px] font-body text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Application button — matching reference site exactly */}
            <Link
              href="/apply"
              className="ml-4 px-6 py-2.5 text-[13px] font-body font-semibold tracking-wider uppercase transition-all duration-200 rounded"
              style={{ backgroundColor: '#5A695F', color: '#FFFFFF' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#4A5A4F'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#5A695F'; }}
            >
              Application
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700"
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
                  className="block py-3 text-base font-body font-medium text-gray-700 hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-2 pl-4 text-sm font-body text-gray-500 hover:text-gray-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4">
              <Link
                href="/apply"
                className="block w-full text-center py-2.5 rounded text-sm font-body font-semibold uppercase tracking-wider text-white"
                style={{ backgroundColor: '#5A695F' }}
                onClick={() => setMobileOpen(false)}
              >
                Application
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
