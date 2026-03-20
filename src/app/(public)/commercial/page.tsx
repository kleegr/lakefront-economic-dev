'use client';
import Link from 'next/link';
import { Maximize2, Building2, MapPin, ShoppingCart, Stethoscope, Store, ArrowRight, CheckCircle, TrendingUp, Users, Globe } from 'lucide-react';

const FEATURED = [
  { title:'SUPERMARKET', desc:'A beautiful full supermarket is a must have in a beautiful community and we\u2019ve designed it with that in mind. Fresh produce, bakery, deli, and kosher selections \u2014 everything a family needs.', sqft:'35,000 SQF', image:'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80' },
  { title:'RETAIL & OFFICE PLAZA', desc:'Space for business within the community is important, and these beautiful retail and office spaces are designed for just that. Modern storefronts, professional suites, and flexible configurations.', sqft:'62,852 SQF', image:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80' },
  { title:'MEDICAL CENTER', desc:'A comprehensive medical center providing primary care, urgent care, pharmacy services, and specialist offices. Designed to serve the entire Lakefront community and surrounding area.', sqft:'12,000 SQF', image:'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80' },
  { title:'SHOPPING DISTRICT', desc:'A vibrant shopping district with diverse retail options \u2014 clothing, gifts, home goods, and specialty stores. The commercial heart of the Lakefront Economy.', sqft:'28,000 SQF', image:'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80' },
];

export default function CommercialPage() {
  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Commercial Lakefront Estates</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">A vibrant community of values in Okeechobee, Florida. Facilities, shopping, and commercial spaces tailored to your convenience and designed for your everyday needs.</p>
    </div></section>

    {/* INTRO */}
    <section className="py-16 lg:py-20 bg-white"><div className="max-container section-padding text-center">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Facilities, Shopping & Commercial Spaces</p>
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest mb-4">Tailored to Your Convenience</h2>
      <p className="text-base text-brand-muted font-body max-w-2xl mx-auto">Designed for your everyday needs. Every commercial space at Lakefront Estates has been thoughtfully planned to create a thriving, self-sustaining community economy.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {[{icon:ShoppingCart,label:'Grocery & Retail'},{icon:Stethoscope,label:'Medical & Health'},{icon:Building2,label:'Office & Professional'},{icon:Store,label:'Dining & Services'}].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-3 p-4">
            <div className="w-14 h-14 rounded-full bg-brand-sage/10 flex items-center justify-center"><item.icon className="w-6 h-6 text-brand-sage" /></div>
            <span className="text-sm font-body font-medium text-brand-text/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div></section>

    {/* FEATURED DEVELOPMENTS — banner cards */}
    <section className="py-16 lg:py-24 bg-brand-warm"><div className="max-container section-padding">
      <div className="text-center mb-14">
        <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Major Developments</p>
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest">What&apos;s Coming to Lakefront</h2>
      </div>
      <div className="space-y-8">
        {FEATURED.map((dev, i) => (
          <div key={dev.title} className={`bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden grid lg:grid-cols-2 ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
            <div className={`p-8 lg:p-12 flex flex-col justify-center ${i % 2 === 1 ? 'lg:col-start-2' : ''}`}>
              <h3 className="font-display text-3xl lg:text-4xl font-bold text-brand-gold mb-4 uppercase tracking-wide">{dev.title}</h3>
              <p className="text-base text-brand-text/60 font-body leading-relaxed mb-6">{dev.desc}</p>
              <div className="flex items-center gap-2 text-sm font-body text-brand-text/70"><Maximize2 className="w-4 h-4 text-brand-gold" /><span className="font-semibold">{dev.sqft}</span></div>
            </div>
            <div className={`relative h-64 lg:h-auto min-h-[320px] ${i % 2 === 1 ? 'lg:col-start-1' : ''}`}>
              <img src={dev.image} alt={dev.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div></section>

    {/* WHY INVEST IN COMMERCIAL */}
    <section className="py-16 lg:py-24 bg-white"><div className="max-container section-padding">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
          <h2 className="font-display text-3xl font-bold text-brand-forest mb-6">Why Open Your Business Here?</h2>
          <div className="space-y-4">
            {[{icon:Users,text:'Built-in customer base \u2014 hundreds of families living right here'},{icon:TrendingUp,text:'Growing community \u2014 new residents moving in regularly'},{icon:Globe,text:'Strategic Florida location \u2014 no state income tax'},{icon:CheckCircle,text:'Brand new facilities \u2014 modern, move-in ready spaces'},{icon:Building2,text:'Flexible configurations \u2014 retail, office, medical, warehouse'},{icon:Store,text:'Community-focused \u2014 businesses that serve real needs'}].map(item => (
              <div key={item.text} className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0 mt-0.5"><item.icon className="w-4 h-4 text-brand-sage" /></div><p className="text-sm font-body text-brand-text/60">{item.text}</p></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[{value:'550',label:'Total Acres',sub:'Master-planned'},{value:'62K+',label:'Retail SqFt',sub:'Under development'},{value:'35K',label:'Market SqFt',sub:'Supermarket'},{value:'12K',label:'Medical SqFt',sub:'Health center'}].map(s => (
            <div key={s.label} className="bg-brand-cream rounded-sm p-6 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{s.value}</div><div className="text-sm font-body font-medium text-brand-text mt-1">{s.label}</div><div className="text-xs font-body text-brand-muted mt-0.5">{s.sub}</div></div>
          ))}
        </div>
      </div>
    </div></section>

    {/* CTA */}
    <section className="py-16 bg-brand-forest relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')] bg-cover bg-center opacity-10" />
      <div className="relative max-container section-padding text-center">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-4">Ready to Be Part of the Lakefront Economy?</h2>
        <p className="text-white/50 font-body mb-8 max-w-lg mx-auto">Whether you want to open a store, set up a professional office, or launch a new venture \u2014 Lakefront Estates is the place to grow.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/apply?type=business" className="btn-primary">Apply for a Space</Link>
          <Link href="/businesses" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white font-body font-medium text-sm tracking-wider uppercase rounded-sm transition-all hover:bg-white/10 hover:border-white/40">View Business Opportunities</Link>
        </div>
      </div>
    </section>

    {/* LINK TO SPACES */}
    <section className="py-12 bg-brand-cream"><div className="max-container section-padding text-center">
      <h3 className="font-display text-xl font-bold text-brand-forest mb-3">Looking for Available Spaces to Rent?</h3>
      <p className="text-sm text-brand-muted font-body mb-6">Browse individual retail suites, office spaces, and warehouse units with pricing and amenities.</p>
      <Link href="/spaces" className="btn-secondary text-xs">View Available Spaces <ArrowRight className="w-4 h-4 ml-2" /></Link>
    </div></section>
  </>);
}
