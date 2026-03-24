'use client';
import Link from 'next/link';
import { MovingBanner } from '@/components/public/MovingBanner';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import { Building2, Warehouse, ArrowRight } from 'lucide-react';

export default function CommercialPage() {
  return (
    <div>
      <MovingBanner page="commercial" title="Commercial Opportunities" badge="Invest & Grow" subtitle="Premium commercial and retail spaces at Lakefront Estates." />
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="max-w-4xl mx-auto space-y-8">
            <ScrollReveal>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>Available Opportunities</h2>
                <p className="text-gray-600 font-body leading-relaxed mb-6">Lakefront Estates is actively leasing commercial, retail, and office spaces. Whether you're looking to open a storefront, medical practice, restaurant, or professional office, we have space for you.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/spaces" className="p-5 border border-gray-100 rounded-lg hover:shadow-md hover:border-[#C9B97A]/30 transition-all group">
                    <Warehouse className="w-6 h-6 text-brand-forest mb-2" />
                    <h3 className="font-display font-semibold text-brand-forest">Browse Spaces</h3>
                    <p className="text-xs text-gray-400 font-body mt-1">View available commercial spaces for rent</p>
                    <span className="text-xs font-body font-semibold mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>View Spaces <ArrowRight className="w-3 h-3" /></span>
                  </Link>
                  <Link href="/apply/space" className="p-5 border border-gray-100 rounded-lg hover:shadow-md hover:border-[#C9B97A]/30 transition-all group">
                    <Building2 className="w-6 h-6 text-brand-forest mb-2" />
                    <h3 className="font-display font-semibold text-brand-forest">Apply for Space</h3>
                    <p className="text-xs text-gray-400 font-body mt-1">Submit a rental application</p>
                    <span className="text-xs font-body font-semibold mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>Apply Now <ArrowRight className="w-3 h-3" /></span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>Why Lakefront?</h2>
                <div className="grid sm:grid-cols-3 gap-4 text-sm font-body text-gray-600">
                  <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-display font-bold text-brand-forest">50+</p><p className="text-xs text-gray-400 mt-1">Commercial Units</p></div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-display font-bold text-brand-forest">10K+</p><p className="text-xs text-gray-400 mt-1">Residents Nearby</p></div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-display font-bold text-brand-forest">24/7</p><p className="text-xs text-gray-400 mt-1">Security & Access</p></div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
