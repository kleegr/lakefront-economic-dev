'use client';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import Link from 'next/link';
import { Building2, Briefcase, Wrench, Warehouse, Users, ArrowRight, Target, TrendingUp, Heart } from 'lucide-react';

// UPDATED: Much more info about vision, Lakefront Economics
export default function AboutPage() {
  return (
    <div>
      {/* Banner */}
      <div className="gradient-forest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-container section-padding py-24 relative z-10">
          <ScrollReveal><div className="text-center">
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Our Story</p>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-white">About Lakefront Economics</h1>
            <div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} />
            <p className="text-lg text-white/60 font-body max-w-2xl mx-auto">Building a thriving economic ecosystem in the heart of Okeechobee, Florida. Where businesses grow, jobs are created, and community prospers.</p>
          </div></ScrollReveal>
        </div>
      </div>

      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Vision */}
            <ScrollReveal>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-4"><Target className="w-7 h-7" style={{ color: '#C9B97A' }} /><h2 className="font-display text-2xl font-bold" style={{ color: '#2C3E2D' }}>Our Vision</h2></div>
                <p className="text-gray-600 font-body leading-relaxed mb-4">Lakefront Estates & Villas is more than just a development \u2014 it's an economic engine. Our vision is to create a self-sustaining community where local businesses thrive, employment opportunities grow, and every stakeholder benefits from the collective success of the Lakefront ecosystem.</p>
                <p className="text-gray-600 font-body leading-relaxed">We believe economic development starts from the ground up: by providing commercial spaces at competitive rates, connecting employers with local talent, supporting service providers, and creating an environment where new businesses want to open their doors.</p>
              </div>
            </ScrollReveal>

            {/* Mission */}
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-4"><TrendingUp className="w-7 h-7" style={{ color: '#C9B97A' }} /><h2 className="font-display text-2xl font-bold" style={{ color: '#2C3E2D' }}>Lakefront Economics \u2014 Our Approach</h2></div>
                <p className="text-gray-600 font-body leading-relaxed mb-4">\"Lakefront Economics\" is our philosophy of community-driven growth. We take a holistic approach to economic development:</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest block mb-1">Job Creation</strong><p className="text-sm text-gray-500">Every new business means new jobs. We actively recruit employers and match them with local talent through our job board and application system.</p></div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest block mb-1">Business Incubation</strong><p className="text-sm text-gray-500">We provide affordable commercial spaces, mentorship connections, and a built-in customer base for businesses starting at Lakefront.</p></div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest block mb-1">Service Provider Network</strong><p className="text-sm text-gray-500">A curated network of trusted vendors serving the community \u2014 from landscaping to IT support to security services.</p></div>
                  <div className="p-4 bg-gray-50 rounded-lg"><strong className="text-brand-forest block mb-1">Community Reinvestment</strong><p className="text-sm text-gray-500">Revenue from commercial leases goes back into community infrastructure, amenities, and programs that benefit everyone.</p></div>
                </div>
              </div>
            </ScrollReveal>

            {/* What We Offer */}
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6"><Heart className="w-7 h-7" style={{ color: '#C9B97A' }} /><h2 className="font-display text-2xl font-bold" style={{ color: '#2C3E2D' }}>What We Offer</h2></div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Link href="/spaces" className="group p-5 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                    <Warehouse className="w-8 h-8 mb-3" style={{ color: '#C9B97A' }} />
                    <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#2C3E2D' }}>Commercial Spaces</h3>
                    <p className="text-sm text-gray-500 font-body mb-2">Retail, office, restaurant, and medical spaces available for lease. Prime locations with foot traffic and lake views.</p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>View Spaces <ArrowRight className="w-4 h-4" /></span>
                  </Link>
                  <Link href="/jobs" className="group p-5 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                    <Briefcase className="w-8 h-8 mb-3" style={{ color: '#C9B97A' }} />
                    <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#2C3E2D' }}>Job Opportunities</h3>
                    <p className="text-sm text-gray-500 font-body mb-2">Employment across retail, healthcare, food service, technology, and more. Full-time, part-time, and seasonal positions.</p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>Browse Jobs <ArrowRight className="w-4 h-4" /></span>
                  </Link>
                  <Link href="/businesses" className="group p-5 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                    <Building2 className="w-8 h-8 mb-3" style={{ color: '#C9B97A' }} />
                    <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#2C3E2D' }}>Business Directory</h3>
                    <p className="text-sm text-gray-500 font-body mb-2">A growing ecosystem of local businesses \u2014 from grocery to medical to dining. Be part of the Lakefront community.</p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>View Businesses <ArrowRight className="w-4 h-4" /></span>
                  </Link>
                  <Link href="/services" className="group p-5 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                    <Wrench className="w-8 h-8 mb-3" style={{ color: '#C9B97A' }} />
                    <h3 className="font-display text-lg font-semibold mb-2" style={{ color: '#2C3E2D' }}>Service Providers</h3>
                    <p className="text-sm text-gray-500 font-body mb-2">Trusted vendors serving the Lakefront community \u2014 landscaping, security, IT, cleaning, and specialized services.</p>
                    <span className="inline-flex items-center gap-1 text-sm font-body font-semibold group-hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>View Providers <ArrowRight className="w-4 h-4" /></span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            {/* Location */}
            <ScrollReveal delay={300}>
              <div className="bg-white rounded-xl border border-gray-100 p-8">
                <h2 className="font-display text-2xl font-bold mb-4" style={{ color: '#2C3E2D' }}>Location & Community</h2>
                <p className="text-gray-600 font-body leading-relaxed mb-4">Located in the heart of Okeechobee, Florida, Lakefront Estates offers easy access to major roads and a scenic lakefront setting. The development blends Florida\u2019s natural beauty with modern commercial infrastructure.</p>
                <p className="text-gray-600 font-body leading-relaxed">Okeechobee is one of Florida\u2019s fastest-growing communities, with increasing demand for housing, commercial services, and employment. Lakefront Estates is positioned to meet this demand while maintaining the small-town character that makes Okeechobee special.</p>
              </div>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal delay={400}>
              <div className="text-center space-y-4">
                <h2 className="font-display text-2xl font-bold" style={{ color: '#2C3E2D' }}>Ready to Join the Lakefront Community?</h2>
                <p className="text-gray-500 font-body max-w-lg mx-auto">Whether you\u2019re looking for a job, a commercial space, or want to offer your services \u2014 there\u2019s a place for you at Lakefront.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/apply" className="px-6 py-3 rounded-full text-sm font-body font-semibold text-white" style={{ backgroundColor: '#2C3E2D' }}>Apply Now</Link>
                  <Link href="/jobs/employer-apply" className="px-6 py-3 rounded-full text-sm font-body font-semibold border-2" style={{ borderColor: '#C9B97A', color: '#C9B97A' }}>Become an Employer</Link>
                  <Link href="/apply/provider" className="px-6 py-3 rounded-full text-sm font-body font-semibold border-2" style={{ borderColor: '#C9B97A', color: '#C9B97A' }}>Become a Provider</Link>
                  <Link href="/apply/space" className="px-6 py-3 rounded-full text-sm font-body font-semibold border-2" style={{ borderColor: '#C9B97A', color: '#C9B97A' }}>Rent a Space</Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
