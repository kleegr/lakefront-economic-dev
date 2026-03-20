'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Maximize2, DollarSign } from 'lucide-react';
import { mockSpaces } from '@/lib/mock-data';
import { formatEnum } from '@/lib/utils';
import type { SpaceType } from '@/types';
const SPACE_TYPES: SpaceType[] = ['retail','office','warehouse','mixed-use','community'];

export default function SpacesPage() {
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
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Available Spaces</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Browse retail, office, and warehouse spaces available for rent within Lakefront Estates.</p>
    </div></section>

    <section className="py-6 bg-white border-b border-gray-200 sticky top-[5.5rem] z-30"><div className="max-container section-padding">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search spaces..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div>
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="input-field py-2.5 text-sm sm:w-48"><option value="">All Types</option>{SPACE_TYPES.map(t => <option key={t} value={t}>{formatEnum(t)}</option>)}</select>
      </div>
    </div></section>

    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding">
      <p className="text-sm font-body text-brand-muted mb-6"><span className="font-semibold text-brand-text">{filtered.length}</span> space{filtered.length !== 1 ? 's' : ''} available</p>
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

      <div className="mt-16 bg-brand-forest rounded-sm p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-white mb-3">Need a Custom Space?</h3>
        <p className="text-white/50 font-body mb-6 max-w-md mx-auto">We can configure spaces to match your exact requirements. Contact us to discuss your needs.</p>
        <Link href="/contact" className="btn-primary">Contact Us</Link>
      </div>
    </div></section>
  </>);
}
