import Link from 'next/link';
import { Target, TrendingUp, Users, Building2, Briefcase, Store, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <section className="gradient-forest pb-16 lg:pb-24">
        <div className="max-container section-padding">
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">About</p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Lakefront Economic Development</h1>
          <p className="text-lg text-white/60 font-body max-w-xl">Building a vibrant economic ecosystem within a community of values in Okeechobee, Florida.</p>
        </div>
      </section>

      {/* OUR MISSION */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-container section-padding">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-sage/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-brand-sage" />
              </div>
              <div>
                <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase">About</p>
                <h2 className="font-display text-3xl font-bold text-brand-forest">Our Mission</h2>
              </div>
            </div>

            <p className="text-base text-brand-text/70 font-body leading-relaxed mb-6">
              At Lakefront Economic Development, our mission is to help build a strong, well-planned, and economically resilient future for Lakefront and the surrounding Okeechobee area. We are committed to creating real opportunity through job growth, business development, investment attraction, service expansion, and the development of commercial and office spaces that support a thriving community. Our focus is on building an environment where people can not only live, but also work, invest, operate businesses, and grow with confidence.
            </p>

            <p className="text-base text-brand-text/70 font-body leading-relaxed mb-6">
              We believe lasting success comes from creating a complete community economy &mdash; one that includes employment opportunities, business activity, essential services, and quality spaces for commerce and professional growth. By supporting new employers, connecting residents to jobs, encouraging entrepreneurship, and helping bring stores, offices, and commercial opportunities into the area, we aim to strengthen the local economy in a way that is both sustainable and beneficial for the broader community.
            </p>

            <p className="text-base text-brand-text/70 font-body leading-relaxed mb-10">
              Guided by long-term vision, practical planning, and a commitment to responsible growth, Lakefront Economic Development exists to turn potential into progress. Our mission is to help create a community where families, business owners, professionals, and investors can all find opportunity, stability, and a shared path toward long-term success.
            </p>

            {/* Key pillars */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 pt-10 border-t border-gray-100">
              {[
                { icon: Briefcase, title: 'Job Growth', desc: 'Connecting residents to meaningful employment and career opportunities within the community.' },
                { icon: Store, title: 'Business Development', desc: 'Supporting entrepreneurs and attracting essential businesses that serve real community needs.' },
                { icon: TrendingUp, title: 'Investment Attraction', desc: 'Creating compelling opportunities for investors to contribute to and benefit from community growth.' },
                { icon: Users, title: 'Service Expansion', desc: 'Bringing essential service providers into the area to support residents and businesses alike.' },
                { icon: Building2, title: 'Commercial Spaces', desc: 'Developing quality retail, office, and commercial spaces for commerce and professional growth.' },
                { icon: ShieldCheck, title: 'Responsible Growth', desc: 'Guided by long-term vision and practical planning for sustainable community benefit.' },
              ].map(pillar => (
                <div key={pillar.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0">
                    <pillar.icon className="w-5 h-5 text-brand-sage" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-brand-forest mb-1">{pillar.title}</h3>
                    <p className="text-sm text-brand-muted font-body">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-16 lg:py-20 bg-brand-cream">
        <div className="max-container section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">The Location</p>
              <h2 className="font-display text-3xl font-bold text-brand-forest mb-6">550 Acres in Okeechobee, Florida</h2>
              <p className="text-base text-brand-text/60 font-body leading-relaxed mb-4">
                Centrally located, Okeechobee is the Gateway to South Florida, offering convenient access to both coasts and all of Central Florida. Less than an hour and a half from Boca Raton, Palm Beach, and Orlando.
              </p>
              <p className="text-base text-brand-text/60 font-body leading-relaxed mb-8">
                Within a 15-minute drive, there is a local shopping district with major chain stores. Nearby beautiful Lake Okeechobee, Florida&apos;s Inland Sea, is the largest freshwater lake in the state.
              </p>
              <Link href="/commercial" className="btn-primary text-xs">Explore Commercial Spaces <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </div>
            <div className="relative rounded-sm overflow-hidden">
              <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80" alt="Modern corporate campus" className="w-full h-80 lg:h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-forest">
        <div className="max-container section-padding text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Get Involved</h2>
          <p className="text-white/60 font-body mb-8 max-w-md mx-auto">Whether you&apos;re looking for a career, opening a business, or exploring investment &mdash; join us in building the Lakefront Economy.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/jobs" className="btn-primary">Browse Jobs</Link>
            <Link href="/businesses" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-sm transition-all hover:bg-white/10">Business Opportunities</Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-sm transition-all hover:bg-white/10">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
