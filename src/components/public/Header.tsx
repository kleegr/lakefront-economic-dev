'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about', children: [{ label: 'Commercial', href: '/commercial' }] },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Businesses', href: '/businesses' },
  { label: 'Services', href: '/services' },
  { label: 'Spaces', href: '/spaces' },
  { label: 'Investors', href: '/investors' },
  { label: 'Contact', href: '/contact' },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 50); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  return (
    <>
      <div className={cn('fixed top-0 left-0 right-0 z-[60] transition-all duration-500', scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-8 opacity-100')}>
        <div className="h-full bg-brand-dark flex items-center justify-between max-container section-padding">
          <div className="flex items-center gap-4">
            <a href="tel:+18633339400" className="text-[11px] text-white/50 font-body hover:text-brand-gold transition-colors">863.333.9400</a>
            <span className="text-white/20">|</span>
            <a href="mailto:info@lakefrontestatesfl.com" className="text-[11px] text-white/50 font-body hover:text-brand-gold transition-colors">info@lakefrontestatesfl.com</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-[11px] text-white/60 font-body font-semibold hover:text-brand-gold transition-colors flex items-center gap-1"><LogIn className="w-3 h-3" />Login / Sign Up</Link>
            <span className="text-white/20">|</span>
            <Link href="/auth/login" className="text-[11px] text-white/40 font-body hover:text-brand-gold transition-colors">Staff Portal</Link>
          </div>
        </div>
      </div>
      <header className={cn('fixed left-0 right-0 z-50 transition-all duration-500', scrolled ? 'top-0 bg-white shadow-lg' : 'top-8 bg-brand-forest')}>
        <div className="max-container section-padding">
          <div className="flex items-center justify-between h-[70px]">
            <Link href="/" className="shrink-0">
              <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-dark-no-icon-large-no-bg-scaled.png" alt="Lakefront Estates &amp; Villas" className={cn('h-14 w-auto transition-all duration-500', scrolled ? '' : 'brightness-0 invert')} />
            </Link>
            <nav className="hidden xl:flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="relative" onMouseEnter={() => item.children && setActiveDropdown(item.label)} onMouseLeave={() => setActiveDropdown(null)}>
                  <Link href={item.href} className={cn('px-3 py-2 text-[11.5px] font-body font-semibold transition-colors duration-200 flex items-center gap-1 uppercase tracking-[0.12em]', scrolled ? 'text-brand-text/70 hover:text-brand-forest' : 'text-white/80 hover:text-white')}>
                    {item.label}{item.children && <ChevronDown className="w-3 h-3" />}
                  </Link>
                  {item.children && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white shadow-xl border border-gray-100 py-2 animate-fade-in">
                      {item.children.map((child) => (<Link key={child.href} href={child.href} className="block px-4 py-2.5 text-[12px] font-body font-medium text-brand-text/70 hover:bg-brand-cream hover:text-brand-forest transition-colors uppercase tracking-wider">{child.label}</Link>))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className={cn('hidden xl:inline-flex items-center gap-1.5 px-4 py-2 font-body font-semibold text-[11px] tracking-[0.15em] uppercase rounded-sm transition-all duration-300 border', scrolled ? 'border-brand-forest/30 text-brand-forest hover:bg-brand-forest hover:text-white' : 'border-white/30 text-white hover:bg-white/10')}>
                <LogIn className="w-3.5 h-3.5" />Login
              </Link>
              <Link href="/apply" className="hidden xl:inline-flex items-center justify-center px-6 py-2.5 bg-brand-gold text-white font-body font-semibold text-[11px] tracking-[0.2em] uppercase rounded-sm transition-all duration-300 hover:bg-brand-gold/90 hover:shadow-lg">Application</Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className={cn('xl:hidden p-2', scrolled ? 'text-brand-forest' : 'text-white')} aria-label="Toggle navigation">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <nav className="section-padding py-4 space-y-1">
              {NAV_ITEMS.map((item) => (<div key={item.label}><Link href={item.href} className="block py-3 text-sm font-body font-medium text-brand-text/70 hover:text-brand-forest uppercase tracking-wider" onClick={() => setMobileOpen(false)}>{item.label}</Link>{item.children?.map((child) => (<Link key={child.href} href={child.href} className="block py-2 pl-4 text-xs font-body text-brand-muted hover:text-brand-forest uppercase tracking-wider" onClick={() => setMobileOpen(false)}>{child.label}</Link>))}</div>))}
              <div className="pt-4 space-y-2">
                <Link href="/auth/login" className="block w-full text-center py-3 border-2 border-brand-forest text-brand-forest font-body font-semibold text-xs uppercase tracking-wider rounded-sm hover:bg-brand-forest hover:text-white transition-all" onClick={() => setMobileOpen(false)}>Login / Sign Up</Link>
                <Link href="/apply" className="btn-primary w-full text-center text-xs" onClick={() => setMobileOpen(false)}>Application</Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
