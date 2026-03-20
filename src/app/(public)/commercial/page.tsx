'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Maximize2, DollarSign, ArrowRight, ShoppingCart, Stethoscope, Warehouse as WarehouseIcon } from 'lucide-react';
import { mockSpaces } from '@/lib/mock-data';
import { formatEnum } from '@/lib/utils';
import type { SpaceType } from '@/types';
const SPACE_TYPES: SpaceType[] = ['retail','office','warehouse','mixed-use','community'];

// Featured commercial developments — matching lakefrontestatesfl.com/commercial
const FEATURED_DEVELOPMENTS = [
  {
    title: 'SUPERMARKET',
    description: 'A beautiful full supermarket is a must have in a beautiful community and we\u2019ve designed it with that in mind.',
    sqft: '35,000 SQF',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80',
    imageAlt: 'Modern grocery store exterior',
  },
  {
    title: 'RETAIL & OFFICE PLAZA',
    description: 'Space for business within the community is important, and these beautiful retail and office spaces are designed for just that.',
    sqft: '62,852 SQF',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    imageAlt: 'Modern retail and office plaza',
  },
  {
    title: 'MEDICAL CENTER',
    description: 'A comprehensive medical center providing primary care, urgent care, and specialty services for the entire community.',
    sqft: '12,000 SQF',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    imageAlt: 'Modern medical center',
  },
];

export default function CommercialPage() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const filtered = useMemo(() => mockSpaces.filter(s => {
    if (!s.isPublic) return false;
    if (query) { const q = query.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.description.toLowerCase().includes(q)) return false; }
    if (selectedType && s.type !== selectedType) return false;
    return true;
  }), [query, selectedType]);

  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Commercial Spaces</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Facilities, shopping, and commercial spaces tailored to your convenience and designed for your everyday needs.</p>
    </div></section>

    {/* FEATURED DEVELOPMENTS — banner-style cards like lakefrontestatesfl.com */}
    <section className="py-16 lg:py-24 bg-brand-warm">
      <div className="max-container section-padding">
        <div className="text-center mb-14">
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Lakefront Economy</p>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest">Major Developments</h2>
        </div>

        <div className="space-y-8">
          {FEATURED_DEVELOPMENTS.map((dev, i) => (
            <div key={dev.title} className={`bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden grid lg:grid-cols-2 ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Text side */}
              <div className={`p-8 lg:p-12 flex flex-col justify-center ${i % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                <h3 className="font-display text-3xl lg:text-4xl font-bold text-brand-gold mb-4 uppercase tracking-wide">{dev.title}</h3>
                <p className="text-base text-brand-text/60 font-body leading-relaxed mb-6">{dev.description}</p>
                <div className="flex items-center gap-2 text-sm font-body text-brand-text/70">
                  <Maximize2 className="w-4 h-4 text-brand-gold" />
                  <span className="font-semibold">{dev.sqft}</span>
                </div>
              </div>
              {/* Image side */}
              <div className={`relative h-64 lg:h-auto min-h-[300px] ${i % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                <img src={dev.image} alt={dev.imageAlt} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* AVAILABLE SPACES TO RENT */}
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-container section-padding">
        <div className="text-center mb-10">
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Available Now</p>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-brand-forest">Spaces for Rent</h2>
          <p className="text-base text-brand-muted font-body mt-3 max-w-lg mx-auto">Retail, office, and warehouse spaces ready for your business.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search spaces..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="input-field py-2.5 text-sm sm:w-48"><option value="">All Types</option>{SPACE_TYPES.map(t => <option key={t} value={t}>{formatEnum(t)}</option>)}</select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(space => (
            <div key={space.id} className="card-public p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-brand-sage/10 text-brand-sage text-xs font-body font-semibold rounded-sm uppercase">{space.type}</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-body font-medium rounded-sm">{formatEnum(space.status)}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-brand-forest mb-2">{space.name}</h3>
              <p className="text-sm text-brand-muted font-body line-clamp-2 mb-4">{space.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-brand-text/70 font-body"><Maximize2 className="w-3.5 h-3.5 text-brand-sage" />{space.sqft.toLocaleString()} sqft</div>
                {space.monthlyRate && <div className="flex items-center gap-1.5 text-sm font-body font-semibold text-brand-forest"><DollarSign className="w-3.5 h-3.5 text-brand-gold" />${space.monthlyRate.toLocaleString()}/mo</div>}
                {space.building && <div className="flex items-center gap-1.5 text-sm text-brand-text/70 font-body"><Building2 className="w-3.5 h-3.5 text-brand-sage" />{space.building}</div>}
                {space.floor && <div className="flex items-center gap-1.5 text-sm text-brand-text/70 font-body"><MapPin className="w-3.5 h-3.5 text-brand-sage" />{space.floor} Floor</div>}
              </div>
              {space.amenities && <div className="flex flex-wrap gap-1 mb-4">{space.amenities.slice(0,3).map(a => <span key={a} className="px-2 py-0.5 bg-gray-100 text-xs font-body text-brand-muted rounded-sm">{a}</span>)}{space.amenities.length > 3 && <span className="px-2 py-0.5 bg-gray-100 text-xs font-body text-brand-muted rounded-sm">+{space.amenities.length - 3} more</span>}</div>}
              <Link href="/contact?type=space" className="btn-secondary text-xs w-full mt-2">Inquire About This Space</Link>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-brand-forest"><div className="max-container section-padding text-center">
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-4">Ready to Set Up Shop?</h2>
      <p className="text-white/50 font-body mb-8 max-w-md mx-auto">Whether you need retail, office, or warehouse space, the Lakefront Economy has the perfect location for your business.</p>
      <div className="flex flex-wrap justify-center gap-4"><Link href="/apply?type=business" className="btn-primary">Apply for a Space</Link><Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white font-body font-medium text-sm tracking-wider uppercase rounded-sm transition-all hover:bg-white/10 hover:border-white/40">Contact Us</Link></div>
    </div></section>
  </>);
}
