import Link from 'next/link';
import { Briefcase, Building2, Store, TrendingUp, MapPin, ArrowRight, ShieldCheck, Sun, DollarSign, GraduationCap, Heart, Stethoscope, ShoppingBag, Users } from 'lucide-react';
import { mockJobs, mockBusinesses, mockSpaces } from '@/lib/mock-data';
import { formatSalary, formatEnum } from '@/lib/utils';

export default function HomePage() {
  const featuredJobs = mockJobs.slice(0, 3);
  return (<>
    {/* HERO — matches lakefrontestatesfl.com */}
    <section className="relative min-h-screen flex items-center justify-center bg-brand-forest overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://lakefrontestatesfl.com/wp-content/uploads/2023/01/drone5b.jpg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-forest/80 via-brand-forest/60 to-brand-forest/90" />
      <div className="relative max-container section-padding w-full py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates & Villas" className="h-20 lg:h-28 w-auto mx-auto mb-10 animate-fade-in opacity-0 stagger-1" />
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-6 animate-fade-in-up opacity-0 stagger-2">Welcome to<br /><span className="text-brand-gold">Lakefront Estates</span></h1>
          <p className="text-lg sm:text-xl text-white/60 font-body leading-relaxed mb-10 max-w-lg mx-auto animate-fade-in-up opacity-0 stagger-3">A vibrant community with strong values and all the amenities a beautiful family needs.</p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up opacity-0 stagger-4">
            <Link href="/about" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white font-body font-semibold text-sm tracking-wider uppercase rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-white/50">About Us</Link>
            <Link href="/apply" className="btn-primary">Apply Now</Link>
          </div>
        </div>
      </div>
    </section>

    {/* YOUR LUXURIOUS HOME — matches reference */}
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-container section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">About Us</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest mb-6">Your Luxurious New Home Awaits</h2>
            <p className="text-base text-brand-text/70 font-body leading-relaxed mb-4">Located on 550 acres in Okeechobee, Florida, Lakefront Estates will feature single-family homes, multi-family units, dedicated office and commercial space, a waterfront, and a rim front for boating.</p>
            <p className="text-base text-brand-text/70 font-body leading-relaxed mb-8">Less than an hour and a half from Boca, Palm Beach, and Orlando, the town features local schools, stores, and other amenities of community life, allowing this beautiful new community to develop.</p>
            <Link href="/apply" className="btn-primary text-xs">Apply Today <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </div>
          <div className="relative">
            <div className="bg-brand-cream rounded-sm p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                {[{icon:ShoppingBag,label:'Shopping Center'},{icon:Stethoscope,label:'Medical Center'},{icon:GraduationCap,label:'Schools & Education'},{icon:ShieldCheck,label:'Security & Safety'},{icon:Heart,label:'Community Services'},{icon:Sun,label:'Year-Round Sunshine'},{icon:DollarSign,label:'Zero Income Tax'},{icon:Users,label:'Supportive Government'}].map(item => (
                  <div key={item.label} className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0"><item.icon className="w-5 h-5 text-brand-sage" /></div><span className="text-sm font-body font-medium text-brand-text/80">{item.label}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* FEATURED JOBS */}
    <section className="py-20 lg:py-28 bg-brand-warm">
      <div className="max-container section-padding">
        <div className="text-center mb-14"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Careers</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest">Open Positions</h2><p className="text-base text-brand-muted font-body mt-3 max-w-lg mx-auto">Find your next career opportunity within the Lakefront community.</p></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{featuredJobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.id}`} className="card-public p-6 group">
            <div className="flex items-start justify-between mb-4"><span className="px-3 py-1 bg-brand-sage/10 text-brand-sage text-xs font-body font-semibold rounded-sm">{formatEnum(job.type)}</span>{job.workMode !== 'on-site' && <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-body font-medium rounded-sm">{formatEnum(job.workMode)}</span>}</div>
            <h3 className="font-display text-lg font-semibold text-brand-forest mb-2 group-hover:text-brand-sage transition-colors">{job.title}</h3>
            <p className="text-sm text-brand-muted font-body mb-1">{job.employerName}</p>
            <div className="flex items-center gap-1 text-sm text-brand-muted font-body mb-4"><MapPin className="w-3.5 h-3.5" />{job.location}</div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between"><span className="text-sm font-body font-semibold text-brand-forest">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span><span className="text-xs text-brand-muted font-body">{job.applicationCount} applicants</span></div>
          </Link>
        ))}</div>
        <div className="text-center mt-10"><Link href="/jobs" className="btn-secondary text-xs">View All Jobs <ArrowRight className="w-4 h-4 ml-2" /></Link></div>
      </div>
    </section>

    {/* OPPORTUNITIES */}
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-container section-padding">
        <div className="text-center mb-14"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Opportunities</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest">Grow With Lakefront</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{icon:Briefcase,title:'Find a Career',desc:'Browse open positions across healthcare, retail, management, and more.',href:'/jobs',cta:'View Jobs'},{icon:Store,title:'Open a Business',desc:'Apply for a storefront or professional services space.',href:'/apply?type=business',cta:'Apply Now'},{icon:TrendingUp,title:'Invest',desc:'Explore investment opportunities in commercial real estate and development.',href:'/investors',cta:'Learn More'},{icon:Building2,title:'Lease a Space',desc:'Discover available retail, office, and warehouse spaces.',href:'/commercial',cta:'View Spaces'}].map(card => (
            <Link key={card.title} href={card.href} className="card-public p-8 text-center group hover:border-brand-sage/30">
              <div className="w-14 h-14 rounded-full bg-brand-sage/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-brand-sage/20 transition-colors"><card.icon className="w-7 h-7 text-brand-sage" /></div>
              <h3 className="font-display text-lg font-semibold text-brand-forest mb-3">{card.title}</h3>
              <p className="text-sm text-brand-muted font-body leading-relaxed mb-5">{card.desc}</p>
              <span className="text-sm font-body font-semibold text-brand-gold group-hover:text-brand-sage transition-colors flex items-center justify-center gap-1">{card.cta} <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* COMMERCIAL SPACES */}
    <section className="py-20 lg:py-28 bg-brand-forest">
      <div className="max-container section-padding">
        <div className="text-center mb-14"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Commercial</p><h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Available Spaces</h2><p className="text-base text-white/50 font-body mt-3 max-w-lg mx-auto">Retail, office, and warehouse spaces designed for your business needs.</p></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{mockSpaces.map(space => (
          <div key={space.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4"><span className="px-2 py-0.5 bg-brand-gold/20 text-brand-gold text-xs font-body font-semibold rounded-sm uppercase">{space.type}</span><span className="text-xs text-white/40 font-body">{space.unit}</span></div>
            <h3 className="font-display text-base font-semibold text-white mb-2">{space.name}</h3>
            <p className="text-sm text-white/40 font-body mb-4 line-clamp-2">{space.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/10"><span className="text-sm font-body text-white/60">{space.sqft.toLocaleString()} sqft</span>{space.monthlyRate && <span className="text-sm font-body font-semibold text-brand-gold">${space.monthlyRate.toLocaleString()}/mo</span>}</div>
          </div>
        ))}</div>
        <div className="text-center mt-10"><Link href="/commercial" className="btn-primary">View All Spaces</Link></div>
      </div>
    </section>

    {/* CTA — matches reference "Experience Exceptional Family Living" */}
    <section className="py-24 bg-brand-cream">
      <div className="max-container section-padding text-center">
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-brand-forest mb-4">Experience Exceptional Family Living</h2>
        <p className="text-base text-brand-muted font-body mb-8 max-w-md mx-auto">Don&apos;t wait! Apply today to secure your future home and business opportunities.</p>
        <Link href="/apply" className="btn-primary">Apply Now</Link>
      </div>
    </section>
  </>);
}
