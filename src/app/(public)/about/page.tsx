import Link from 'next/link';
import { MapPin, ShoppingBag, GraduationCap, Stethoscope, Building2, Sun, Shield, Heart, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <section className="gradient-forest py-16 lg:py-24">
        <div className="max-container section-padding">
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">About</p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Lakefront Economic Development</h1>
          <p className="text-lg text-white/60 font-body max-w-xl">Building a vibrant economic ecosystem within a community of values in Okeechobee, Florida.</p>
        </div>
      </section>
      <section className="py-16 lg:py-24 bg-brand-warm">
        <div className="max-container section-padding"><div className="max-w-3xl"><h2 className="font-display text-3xl font-bold text-brand-forest mb-6">Our Mission</h2><p className="text-lg text-brand-text/70 font-body leading-relaxed mb-4">Lakefront Economic Development exists to cultivate a thriving local economy within Lakefront Estates — a 550-acre master-planned community in Okeechobee, Florida.</p></div></div>
      </section>
      <section className="py-16 bg-brand-forest">
        <div className="max-container section-padding text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Get Involved</h2>
          <p className="text-white/60 font-body mb-8 max-w-md mx-auto">Whether you&apos;re looking for a career, opening a business, or exploring investment — join us.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-sm transition-all hover:bg-white/10">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
