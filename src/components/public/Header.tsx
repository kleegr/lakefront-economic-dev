'use client';

import { useState, useEffect } from 'react';
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 glass-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <div className="flex flex-col">
              <span
                className="transition-colors duration-300 group-hover:opacity-80"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#2C3E2D', lineHeight: 1.1, letterSpacing: '-0.5px' }}
              >
                Lakefront
              </span>
              <span style={{ fontFamily: "'Source Sans 3', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' as const, color: '#9A8A5A', lineHeight: 1 }}>
                Estates &amp; Villas
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
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
                    className="relative px-4 py-2 text-[14px] font-body font-medium flex items-center gap-1 text-[#4A5A4F] hover:text-[#2C3E2D] transition-colors duration-300 group"
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#C9B97A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-gray-100/50 py-2 animate-fade-in-scale opacity-0 stagger-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-[13px] font-body text-[#4A5A4F] hover:text-[#2C3E2D] hover:bg-gray-50/80 hover:pl-5 transition-all duration-200"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <Link
              href="/apply"
              className="ml-4 px-6 py-2.5 text-[12px] font-body font-semibold tracking-[0.15em] uppercase rounded-full transition-all duration-300 btn-magnetic"
              style={{ backgroundColor: '#2C3E2D', color: '#FFFFFF' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#C9B97A'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2C3E2D'; }}
            >
              Application
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-[#2C3E2D]"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-xl animate-fade-in">
          <nav className="section-padding py-6 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="block py-3 text-base font-body font-medium text-[#4A5A4F] hover:text-[#2C3E2D] hover:pl-2 transition-all duration-200" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                {item.children?.map((child) => (<Link key={child.href} href={child.href} className="block py-2 pl-4 text-sm font-body text-gray-400 hover:text-[#2C3E2D] transition-colors" onClick={() => setMobileOpen(false)}>{child.label}</Link>))}
              </div>
            ))}
            <div className="pt-4">
              <Link href="/apply" className="block w-full text-center py-3 rounded-full text-sm font-body font-semibold uppercase tracking-wider text-white" style={{ backgroundColor: '#2C3E2D' }} onClick={() => setMobileOpen(false)}>Application</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
