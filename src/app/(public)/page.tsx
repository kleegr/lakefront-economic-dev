'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Building2, Store, TrendingUp, MapPin, ArrowRight, ShieldCheck, Sun, DollarSign, GraduationCap, Heart, Stethoscope, ShoppingBag, Users, Wrench, AlertCircle } from 'lucide-react';
import { mockJobs, mockSpaces, businessOpportunities, serviceOpportunities } from '@/lib/mock-data';
import { formatSalary, formatEnum } from '@/lib/utils';

// Luxury high-class professional business images — NO PEOPLE
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80', // modern luxury office lobby
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&q=80', // executive boardroom glass
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80', // glass skyscraper looking up
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1920&q=80', // modern corporate campus
  'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=1920&q=80', // luxury office building exterior
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % HERO_IMAGES.length), 15000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {HERO_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${i === current ? 'opacity-30' : 'opacity-0'}`}
        >
          <div
            className="absolute inset-[-10%] bg-cover bg-center"
            style={{
              backgroundImage: `url(${img})`,
              animation: `panImage${i % 3} 30s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
    </>
  );
}

export default function HomePage() {
  const featuredJobs = mockJobs.slice(0, 3);
  const availableBiz = businessOpportunities.filter(b => b.status === 'available').length;
  const neededSvc = serviceOpportunities.filter(s => s.status === 'needed' || s.status === 'partial').length;
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(p => (p + 1) % 5), 15000);
    return () => clearInterval(t);
  }, []);

  return (<>
    {/* HERO with moving panning background */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-brand-forest" />
      <HeroBanner />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-forest/30 to-brand-dark/70" />
      <div className="relative max-container section-padding w-full text-center py-40">
        <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-16 lg:h-24 w-auto mx-auto mb-8 animate-fade-in opacity-0 stagger-1" />
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-6 animate-fade-in-up opacity-0 stagger-2">Welcome to Lakefront Estates<br/><span className="text-brand-gold">Economic Development</span></h1>
        <p className="text-lg text-white/50 font-body leading-relaxed mb-10 max-w-xl mx-auto animate-fade-in-up opacity-0 stagger-3">A vibrant community with strong values. Explore jobs, business opportunities, and investment in the growing Lakefront Economy.</p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up opacity-0 stagger-4">
          <Link href="/about" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white font-body font-medium text-sm tracking-wider uppercase rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-white/40">About Us</Link>
          <Link href="/apply" className="btn-primary">Apply Now</Link>
        </div>
        <div className="flex justify-center gap-2 mt-12">
          {[0,1,2,3,4].map(i => (<span key={i} className={`h-2 rounded-full transition-all duration-700 ${i === heroIdx ? 'bg-brand-gold w-8' : 'bg-white/30 w-2'}`} />))}
        </div>
      </div>
    </section>

    {/* STATS BAR */}
    <section className="py-5 bg-brand-dark"><div className="max-container section-padding">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{value:mockJobs.length+'+',label:'Open Jobs',icon:Briefcase,href:'/jobs'},{value:availableBiz+'',label:'Businesses Available',icon:Store,href:'/businesses'},{value:neededSvc+'',label:'Services Needed',icon:Wrench,href:'/services'},{value:mockSpaces.length+'',label:'Spaces Available',icon:Building2,href:'/commercial'}].map(s => (
          <Link key={s.label} href={s.href} className="flex items-center gap-3 py-4 px-2 group">
            <s.icon className="w-5 h-5 text-brand-gold shrink-0" />
            <div><div className="text-xl font-display font-bold text-white">{s.value}</div><div className="text-[11px] font-body text-white/40 uppercase tracking-wider group-hover:text-brand-gold transition-colors">{s.label}</div></div>
          </Link>
        ))}
      </div>
    </div></section>

    {/* ABOUT */}
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-container section-padding"><div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest mb-6">A Complete Economic Ecosystem</h2>
          <p className="text-base text-brand-text/60 font-body leading-relaxed mb-4">Located on 550 acres in Okeechobee, Florida, Lakefront Estates is building more than homes &mdash; it&apos;s building a complete economy. Local businesses, essential services, career opportunities, and investment prospects all in one community.</p>
          <p className="text-base text-brand-text/60 font-body leading-relaxed mb-8">Less than an hour and a half from Boca, Palm Beach, and Orlando, the Lakefront Economy offers unique opportunities for entrepreneurs, service providers, and investors.</p>
          <Link href="/about" className="btn-primary text-xs">Learn More <ArrowRight className="w-4 h-4 ml-2" /></Link>
        </div>
        <div className="relative rounded-sm overflow-hidden">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="Luxury modern office interior" className="w-full h-80 lg:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/30 to-transparent" />
        </div>
      </div></div>
    </section>

    {/* BUSINESS OPPORTUNITIES */}
    <section className="py-16 lg:py-20 bg-brand-cream">
      <div className="max-container section-padding">
        <div className="flex items-end justify-between mb-10"><div><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Lakefront Economy</p><h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest">Essential Businesses Needed</h2><p className="text-sm text-brand-muted font-body mt-2"><span className="font-semibold text-green-600">{availableBiz} opportunities</span> available for entrepreneurs</p></div><Link href="/businesses" className="hidden sm:flex items-center gap-1 text-sm font-body font-semibold text-brand-sage hover:text-brand-forest transition-colors">View All <ArrowRight className="w-3.5 h-3.5" /></Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessOpportunities.filter(b => b.status === 'available').slice(0,4).map(biz => (
            <div key={biz.id} className="bg-white rounded-sm border border-green-200 p-5 hover:shadow-md transition-all"><h3 className="font-display text-base font-semibold text-brand-forest mb-1">{biz.name}</h3><p className="text-xs text-brand-gold font-body uppercase tracking-wider mb-2">{biz.category}</p><p className="text-sm text-brand-muted font-body line-clamp-2 mb-3">{biz.description}</p><Link href="/apply?type=business" className="text-xs font-body font-semibold text-brand-gold hover:text-brand-sage flex items-center gap-1">Apply <ArrowRight className="w-3 h-3" /></Link></div>
          ))}
        </div>
      </div>
    </section>

    {/* FEATURED JOBS */}
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-container section-padding">
        <div className="text-center mb-14"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Careers</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest">Open Positions</h2><p className="text-base text-brand-muted font-body mt-3 max-w-lg mx-auto">Find your next career in the Lakefront Economy.</p></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{featuredJobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="card-public p-6 group">
            <div className="flex items-start justify-between mb-4"><span className="px-3 py-1 bg-brand-sage/10 text-brand-sage text-xs font-body font-semibold rounded-sm">{formatEnum(job.type)}</span></div>
            <h3 className="font-display text-lg font-semibold text-brand-forest mb-2 group-hover:text-brand-sage transition-colors">{job.title}</h3>
            <p className="text-sm text-brand-muted font-body mb-1">{job.employerName}</p>
            <div className="flex items-center gap-1 text-sm text-brand-muted font-body mb-4"><MapPin className="w-3.5 h-3.5" />{job.location}</div>
            <div className="pt-4 border-t border-gray-100"><span className="text-sm font-body font-semibold text-brand-forest">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span></div>
          </Link>
        ))}</div>
        <div className="text-center mt-10"><Link href="/jobs" className="btn-secondary text-xs">View All Jobs <ArrowRight className="w-4 h-4 ml-2" /></Link></div>
      </div>
    </section>

    {/* SERVICES NEEDED */}
    <section className="py-16 bg-brand-warm"><div className="max-container section-padding">
      <div className="flex items-end justify-between mb-10"><div><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Lakefront Economy</p><h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest">Service Providers Needed</h2><p className="text-sm text-brand-muted font-body mt-2"><span className="font-semibold text-red-600">{neededSvc} services</span> still looking for providers</p></div><Link href="/services" className="hidden sm:flex items-center gap-1 text-sm font-body font-semibold text-brand-sage hover:text-brand-forest transition-colors">View All <ArrowRight className="w-3.5 h-3.5" /></Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceOpportunities.filter(s => s.status === 'needed').slice(0,4).map(svc => (
          <div key={svc.id} className="bg-white rounded-sm border border-gray-100 p-5 hover:shadow-md hover:border-red-200 transition-all"><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-[11px] font-body font-semibold text-red-600 uppercase tracking-wider">Needed</span></div><h3 className="font-display text-base font-semibold text-brand-forest mb-1">{svc.name}</h3><p className="text-xs text-brand-muted font-body mb-3">{svc.category}</p><Link href="/apply?type=provider" className="text-xs font-body font-semibold text-brand-gold hover:text-brand-sage flex items-center gap-1">Apply <ArrowRight className="w-3 h-3" /></Link></div>
        ))}
      </div>
    </div></section>

    {/* SPACES */}
    <section className="py-20 lg:py-28 bg-brand-forest relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')] bg-cover bg-center opacity-10" />
      <div className="relative max-container section-padding">
        <div className="text-center mb-14"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Lakefront Economy</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Available Spaces</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{mockSpaces.map(space => (<div key={space.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-6 hover:bg-white/10 transition-all duration-300"><div className="flex items-center justify-between mb-4"><span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-[11px] font-body font-semibold rounded-sm uppercase">{space.type}</span></div><h3 className="font-display text-base font-semibold text-white mb-2">{space.name}</h3><p className="text-sm text-white/40 font-body mb-4 line-clamp-2">{space.description}</p><div className="flex items-center justify-between pt-4 border-t border-white/10"><span className="text-sm font-body text-white/50">{space.sqft.toLocaleString()} sqft</span>{space.monthlyRate && <span className="text-sm font-body font-semibold text-brand-gold">${space.monthlyRate.toLocaleString()}/mo</span>}</div></div>))}</div>
        <div className="text-center mt-10"><Link href="/commercial" className="btn-primary">View All Spaces</Link></div>
      </div>
    </section>

    {/* CTA */}
    <section className="relative py-24 overflow-hidden"><div className="absolute inset-0 bg-brand-cream" /><div className="relative max-container section-padding text-center"><h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest mb-4">Join the Lakefront Economy</h2><p className="text-base text-brand-muted font-body mb-8 max-w-md mx-auto">Whether you&apos;re a job seeker, entrepreneur, service provider, or investor &mdash; there&apos;s a place for you.</p><div className="flex flex-wrap justify-center gap-4"><Link href="/apply" className="btn-primary">Apply Now</Link><Link href="/investors" className="btn-secondary text-xs">Invest in Lakefront Economy</Link></div></div></section>
  </>);
}
