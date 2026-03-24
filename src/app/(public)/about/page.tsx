'use client';
import { MovingBanner } from '@/components/public/MovingBanner';
import { ScrollReveal } from '@/components/public/ScrollReveal';

export default function AboutPage() {
  return (
    <div>
      <MovingBanner page="about" title="About Lakefront" badge="Our Story" subtitle="A master-planned community in the heart of Okeechobee, Florida." />
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="max-w-3xl mx-auto space-y-8">
            <ScrollReveal>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>Our Vision</h2>
                <p className="text-gray-600 font-body leading-relaxed">Lakefront Estates & Villas is a premier mixed-use development in Okeechobee, Florida, offering commercial spaces, business opportunities, and employment for the growing community. Our vision is to create a thriving economic hub where businesses, service providers, and residents come together.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>What We Offer</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm font-body text-gray-600">
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest">Commercial Spaces</strong> — Retail, office, restaurant, and medical spaces available for lease</div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest">Job Opportunities</strong> — Employment for the community with diverse roles</div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest">Business Directory</strong> — A growing ecosystem of local businesses</div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest">Service Providers</strong> — Trusted vendors serving the Lakefront community</div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>Location</h2>
                <p className="text-gray-600 font-body leading-relaxed">Located in the heart of Okeechobee, Florida, Lakefront Estates offers easy access to major roads and a scenic lakefront setting. The development is designed to blend Florida's natural beauty with modern commercial infrastructure.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
