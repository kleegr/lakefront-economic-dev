'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about', children: [{ label: 'Residential', href: '/about' }, { label: 'Commercial', href: '/commercial' }] },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Businesses', href: '/businesses' },
  { label: 'Services', href: '/services' },
  { label: 'Investors', href: '/investors' },
  { label: 'Contact', href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      scrolled ? 'bg-white/98 backdrop-blur-md shadow-md' : 'bg-brand-forest/95 backdrop-blur-sm'
    )}>
      <div className="max-container section-padding">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-dark-no-icon-large-no-bg-scaled.png"
              alt="Lakefront Estates & Villas"
              className={cn('h-12 lg:h-16 w-auto transition-all duration-500', scrolled ? 'brightness-100' : 'brightness-0 invert')}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="relative" onMouseEnter={() => item.children && setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
                <Link href={item.href} className={cn(
                  'px-4 py-2 text-sm font-body font-medium transition-colors duration-200 flex items-center gap-1',
                  scrolled ? 'text-brand-text/80 hover:text-brand-forest' : 'text-white/85 hover:text-white'
                )}>
                  {item.label}{item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-sm shadow-xl border border-gray-100 py-2 animate-fade-in">
                    {item.children.map((child) => (<Link key={child.href} href={child.href} className="block px-4 py-2.5 text-sm font-body text-brand-text/80 hover:bg-brand-cream hover:text-brand-forest transition-colors">{child.label}</Link>))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/apply" className={cn(
              'inline-flex items-center justify-center px-7 py-3 font-body font-semibold text-xs tracking-[0.15em] uppercase rounded-sm transition-all duration-300',
              scrolled
                ? 'bg-brand-gold text-white hover:bg-brand-gold/90 hover:shadow-lg'
                : 'bg-brand-gold text-white hover:bg-brand-gold/90 hover:shadow-lg'
            )}>Application</Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className={cn('lg:hidden p-2', scrolled ? 'text-brand-forest' : 'text-white')} aria-label="Toggle navigation">
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
                <Link href={item.href} className="block py-3 text-base font-body font-medium text-brand-text/80 hover:text-brand-forest" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                {item.children?.map((child) => (<Link key={child.href} href={child.href} className="block py-2 pl-4 text-sm font-body text-brand-muted hover:text-brand-forest" onClick={() => setMobileOpen(false)}>{child.label}</Link>))}
              </div>
            ))}
            <div className="pt-4"><Link href="/apply" className="btn-primary w-full text-center text-xs" onClick={() => setMobileOpen(false)}>Application</Link></div>
          </nav>
        </div>
      )}
    </header>
  );
}
