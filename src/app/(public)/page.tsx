'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Store, MapPin, ArrowRight, Wrench, AlertCircle, ArrowDown } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920&q=80',
  'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1920&q=80',
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % HERO_IMAGES.length), 12000);
    return () => clearInterval(timer);
  }, []);
  return (<>
    {HERO_IMAGES.map((img, i) => (
      <div key={i} className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${i === current ? 'opacity-25' : 'opacity-0'}`}>
        <div className="absolute inset-[-10%] bg-cover bg-center" style={{ backgroundImage: `url(${img})`, animation: `panImage${i % 3} 25s ease-in-out infinite` }} />
      </div>
    ))}
  </>);
}

function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  return ref;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 1500;
        const startTime = performance.now();
        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function formatEnum(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const parallaxRef = useParallax(0.15);

  useEffect(() => {
    fetch('/api/public/homepage-data')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ jobs: [], totalJobs: 0, spaces: [], totalSpaces: 0, businessOpportunities: [], availableBizCount: 0, serviceOpportunities: [], neededSvcCount: 0 }));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(p => (p + 1) % 5), 12000);
    return () => clearInterval(t);
  }, []);

  const featuredJobs = data?.jobs?.slice(0, 3) || [];
  const availableBiz = data?.availableBizCount || 0;
  const neededSvc = data?.neededSvcCount || 0;
  const spaces = data?.spaces || [];
  const bizOpps = data?.businessOpportunities || [];
  const svcOpps = data?.serviceOpportunities || [];

  return (<>
    {/* HERO */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#1a2a1c]" />
      <HeroBanner />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a1c]/70 via-transparent to-[#1a2a1c]/80" />
      <div ref={parallaxRef} className="relative max-container section-padding w-full text-center py-40 parallax-slow">
        <div className="mb-10 animate-fade-in opacity-0 stagger-1">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-14 lg:h-20 w-auto mx-auto" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.8rem] font-bold text-white leading-[1.08] mb-6 animate-fade-in-up opacity-0 stagger-2">
          Welcome to Lakefront Estates<br /><span style={{ color: '#C9B97A' }}>Economic Development</span>
        </h1>
        <p className="text-lg text-white/45 font-body leading-relaxed mb-12 max-w-xl mx-auto animate-fade-in-up opacity-0 stagger-3">
          A vibrant community with strong values. Explore jobs, business opportunities, and investment in the growing Lakefront Economy.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up opacity-0 stagger-4">
          <Link href="/about" className="group inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white font-body font-medium text-sm tracking-wider uppercase rounded-full transition-all duration-400 hover:bg-white/10 hover:border-white/40 hover:tracking-[0.2em] btn-magnetic">About Us</Link>
          <Link href="/apply" className="group inline-flex items-center justify-center px-8 py-3.5 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-full transition-all duration-400 hover:shadow-lg hover:shadow-[#C9B97A]/30 hover:tracking-[0.2em] btn-magnetic" style={{ backgroundColor: '#C9B97A' }}>Apply Now <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" /></Link>
        </div>
        <div className="flex justify-center gap-2 mt-14">
          {Array.from({length: 5}).map((_, i) => (<span key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === heroIdx ? 'w-8' : 'w-1.5 bg-white/25'}`} style={i === heroIdx ? { backgroundColor: '#C9B97A' } : {}} />))}
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"><ArrowDown className="w-5 h-5 text-white/30" /></div>
      </div>
    </section>

    {/* STATS BAR */}
    <section className="py-6" style={{ background: 'linear-gradient(135deg, #1a2a1c 0%, #2C3E2D 100%)' }}>
      <div className="max-container section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: data?.totalJobs || 0, suffix: '+', label: 'Open Jobs', icon: Briefcase, href: '/jobs' },
            { value: availableBiz, suffix: '', label: 'Businesses Available', icon: Store, href: '/businesses' },
            { value: neededSvc, suffix: '', label: 'Services Needed', icon: Wrench, href: '/services' },
            { value: data?.totalSpaces || 0, suffix: '', label: 'Spaces Available', icon: Building2, href: '/commercial' },
          ].map(s => (
            <Link key={s.label} href={s.href} className="flex items-center gap-3 py-3 px-2 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white/10" style={{ background: 'rgba(201,185,122,0.15)' }}>
                <s.icon className="w-4 h-4" style={{ color: '#C9B97A' }} />
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-white"><AnimatedCounter value={s.value} suffix={s.suffix} /></div>
                <div className="text-[10px] font-body text-white/35 uppercase tracking-wider group-hover:text-[#C9B97A] transition-colors duration-300">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ABOUT */}
    <section className="py-24 lg:py-32 bg-[#FAFAF7]">
      <div className="max-container section-padding"><div className="grid lg:grid-cols-2 gap-20 items-center">
        <ScrollReveal variant="left">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 font-body font-semibold" style={{ color: '#C9B97A' }}>Lakefront Economy</p>
          <h2 className="font-display text-3xl lg:text-[2.5rem] font-bold leading-tight mb-6" style={{ color: '#2C3E2D' }}>A Complete Economic<br />Ecosystem</h2>
          <div className="w-12 h-[2px] mb-8" style={{ backgroundColor: '#C9B97A' }} />
          <p className="text-base text-gray-500 font-body leading-[1.85] mb-4">Located on 550 acres in Okeechobee, Florida, Lakefront Estates is building more than homes &mdash; it&apos;s building a complete economy.</p>
          <p className="text-base text-gray-500 font-body leading-[1.85] mb-10">Less than an hour and a half from Boca, Palm Beach, and Orlando, the Lakefront Economy offers unique opportunities for entrepreneurs, service providers, and investors.</p>
          <Link href="/about" className="group inline-flex items-center gap-2 text-sm font-body font-semibold tracking-wider uppercase transition-all duration-300 btn-magnetic" style={{ color: '#2C3E2D' }}>Learn More <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <div className="relative group">
            <div className="overflow-hidden rounded-2xl"><img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="Modern office" className="w-full h-80 lg:h-[440px] object-cover transition-transform duration-700 group-hover:scale-105" /></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#2C3E2D' }}>
              <div className="text-center"><span className="block text-2xl font-display font-bold text-white">550</span><span className="block text-[9px] uppercase tracking-widest font-body" style={{ color: '#C9B97A' }}>Acres</span></div>
            </div>
          </div>
        </ScrollReveal>
      </div></div>
    </section>

    {/* BUSINESS OPPORTUNITIES */}
    <section className="py-20 lg:py-24" style={{ backgroundColor: '#F5F4EF' }}>
      <div className="max-container section-padding">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Lakefront Economy</p>
              <h2 className="font-display text-2xl lg:text-3xl font-bold" style={{ color: '#2C3E2D' }}>Essential Businesses Needed</h2>
              <p className="text-sm text-gray-400 font-body mt-2"><span className="font-semibold text-green-600">{availableBiz} opportunities</span> available for entrepreneurs</p>
            </div>
            <Link href="/businesses" className="hidden sm:flex items-center gap-1.5 text-sm font-body font-semibold transition-colors duration-300 hover:gap-2.5" style={{ color: '#2C3E2D' }}>View All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bizOpps.map((biz: any, i: number) => (
            <ScrollReveal key={biz.id} delay={i * 100}>
              <div className="bg-white rounded-xl border border-gray-100/80 p-6 hover-lift group">
                <h3 className="font-display text-base font-semibold mb-1 transition-colors duration-300 group-hover:text-[#C9B97A]" style={{ color: '#2C3E2D' }}>{biz.name}</h3>
                <p className="text-[11px] uppercase tracking-wider mb-3 font-body" style={{ color: '#C9B97A' }}>{biz.category}</p>
                <p className="text-sm text-gray-400 font-body line-clamp-2 mb-4">{biz.description}</p>
                <Link href="/apply?type=business" className="inline-flex items-center gap-1 text-xs font-body font-semibold transition-all duration-300 group-hover:gap-2" style={{ color: '#C9B97A' }}>Apply <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* FEATURED JOBS - now from Supabase */}
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-container section-padding">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Careers</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: '#2C3E2D' }}>Open Positions</h2>
            <div className="w-12 h-[2px] mx-auto mt-4" style={{ backgroundColor: '#C9B97A' }} />
            <p className="text-base text-gray-400 font-body mt-4 max-w-lg mx-auto">Find your next career in the Lakefront Economy.</p>
          </div>
        </ScrollReveal>
        {featuredJobs.length === 0 && !data ? (
          <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#C9B97A] border-t-transparent rounded-full mx-auto" /></div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-body">No open positions right now. Check back soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job: any, i: number) => (
              <ScrollReveal key={job.id} delay={i * 120}>
                <Link href={`/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-100 p-6 hover-lift group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-body font-semibold" style={{ backgroundColor: 'rgba(44,62,45,0.08)', color: '#2C3E2D' }}>{formatEnum(job.type)}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-[#C9B97A]" style={{ color: '#2C3E2D' }}>{job.title}</h3>
                  <p className="text-sm text-gray-400 font-body mb-1">{job.employerName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-400 font-body mb-4"><MapPin className="w-3.5 h-3.5" />{job.location}</div>
                  <div className="pt-4 border-t border-gray-50">
                    <span className="text-sm font-body font-semibold" style={{ color: '#2C3E2D' }}>{job.salaryRange || 'Competitive'}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
        <ScrollReveal>
          <div className="text-center mt-12">
            <Link href="/jobs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-body font-semibold tracking-wider uppercase transition-all duration-300 btn-magnetic" style={{ border: '2px solid #2C3E2D', color: '#2C3E2D' }}>View All Jobs <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* SERVICES NEEDED */}
    <section className="py-20 bg-[#FAFAF7]">
      <div className="max-container section-padding">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Lakefront Economy</p>
              <h2 className="font-display text-2xl lg:text-3xl font-bold" style={{ color: '#2C3E2D' }}>Service Providers Needed</h2>
              <p className="text-sm text-gray-400 font-body mt-2"><span className="font-semibold text-red-500">{neededSvc} services</span> still looking for providers</p>
            </div>
            <Link href="/services" className="hidden sm:flex items-center gap-1.5 text-sm font-body font-semibold transition-all duration-300 hover:gap-2.5" style={{ color: '#2C3E2D' }}>View All <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {svcOpps.map((svc: any, i: number) => (
            <ScrollReveal key={svc.id} delay={i * 100}>
              <div className="bg-white rounded-xl border border-gray-100/80 p-6 hover-lift group">
                <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /><span className="text-[10px] font-body font-semibold text-red-500 uppercase tracking-wider">Needed</span></div>
                <h3 className="font-display text-base font-semibold mb-1 transition-colors duration-300 group-hover:text-[#C9B97A]" style={{ color: '#2C3E2D' }}>{svc.name}</h3>
                <p className="text-xs text-gray-400 font-body mb-4">{svc.category}</p>
                <Link href="/apply?type=provider" className="inline-flex items-center gap-1 text-xs font-body font-semibold transition-all duration-300 group-hover:gap-2" style={{ color: '#C9B97A' }}>Apply <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* SPACES */}
    <section className="py-24 lg:py-32 relative overflow-hidden" style={{ backgroundColor: '#2C3E2D' }}>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')] bg-cover bg-center opacity-[0.07]" />
      <div className="relative max-container section-padding">
        <ScrollReveal><div className="text-center mb-16"><p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Lakefront Economy</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Available Spaces</h2><div className="w-12 h-[2px] mx-auto mt-4" style={{ backgroundColor: '#C9B97A' }} /></div></ScrollReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaces.map((space: any, i: number) => (
            <ScrollReveal key={space.id} delay={i * 100}>
              <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.15] hover-lift">
                <div className="flex items-center justify-between mb-4"><span className="px-3 py-1 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider" style={{ backgroundColor: 'rgba(201,185,122,0.2)', color: '#C9B97A' }}>{space.type}</span></div>
                <h3 className="font-display text-base font-semibold text-white mb-2">{space.name}</h3>
                <p className="text-sm text-white/30 font-body mb-4 line-clamp-2">{space.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <span className="text-sm font-body text-white/40">{space.sqft?.toLocaleString()} sqft</span>
                  {space.monthlyRate ? <span className="text-sm font-body font-semibold" style={{ color: '#C9B97A' }}>${space.monthlyRate?.toLocaleString()}/mo</span> : null}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal><div className="text-center mt-12"><Link href="/commercial" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-body font-semibold tracking-wider uppercase transition-all duration-300 text-white btn-magnetic" style={{ backgroundColor: '#C9B97A' }}>View All Spaces</Link></div></ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="relative py-28 overflow-hidden bg-[#FAFAF7]">
      <div className="max-container section-padding text-center relative">
        <ScrollReveal variant="scale">
          <h2 className="font-display text-3xl lg:text-[2.5rem] font-bold leading-tight mb-4" style={{ color: '#2C3E2D' }}>Join the Lakefront Economy</h2>
          <div className="w-12 h-[2px] mx-auto mt-2 mb-6" style={{ backgroundColor: '#C9B97A' }} />
          <p className="text-base text-gray-400 font-body mb-10 max-w-md mx-auto leading-relaxed">Whether you&apos;re a job seeker, entrepreneur, service provider, or investor &mdash; there&apos;s a place for you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-body font-semibold tracking-wider uppercase text-white transition-all duration-400 hover:shadow-lg hover:shadow-[#C9B97A]/20 btn-magnetic" style={{ backgroundColor: '#C9B97A' }}>Apply Now <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
            <Link href="/investors" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-body font-semibold tracking-wider uppercase transition-all duration-300 btn-magnetic" style={{ border: '2px solid #2C3E2D', color: '#2C3E2D' }}>Invest in Lakefront</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </>);
}
