'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Wrench } from 'lucide-react';
import { mockProviders } from '@/lib/mock-data';
import { formatEnum } from '@/lib/utils';
import type { ProviderCategory } from '@/types';
const CATEGORIES: ProviderCategory[] = ['construction','maintenance','landscaping','security','cleaning','technology','consulting','catering','other'];
export default function ServicesPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const filtered = useMemo(() => mockProviders.filter(p => {
    if (!p.isPublic) return false;
    if (query) { const q = query.toLowerCase(); if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false; }
    if (selectedCategory && p.category !== selectedCategory) return false;
    return true;
  }), [query, selectedCategory]);
  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Providers</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Service Providers</h1><p className="text-lg text-white/60 font-body max-w-xl">Trusted vendors and service providers supporting the Lakefront community.</p></div></section>
    <section className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm"><div className="max-container section-padding py-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search providers..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field py-2.5 text-sm sm:w-56"><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{formatEnum(c)}</option>)}</select></div></div></section>
    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding"><p className="text-sm font-body text-brand-muted mb-6"><span className="font-semibold text-brand-text">{filtered.length}</span> provider{filtered.length !== 1 ? 's' : ''} listed</p>{filtered.length > 0 ? (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(prov => (<div key={prov.id} className="card-public p-6"><div className="flex items-start gap-4 mb-4"><div className="w-12 h-12 rounded-sm bg-brand-sage/10 flex items-center justify-center shrink-0"><Wrench className="w-6 h-6 text-brand-sage" /></div><div><h3 className="font-display text-lg font-semibold text-brand-forest">{prov.name}</h3><span className="inline-block px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-body font-medium rounded-sm mt-1">{formatEnum(prov.category)}</span></div></div><p className="text-sm text-brand-muted font-body line-clamp-3 mb-4">{prov.description}</p>{prov.contactPhone && <p className="text-sm text-brand-text/70 font-body">{prov.contactPhone}</p>}</div>))}</div>) : (<div className="text-center py-20"><Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="font-display text-xl font-semibold text-brand-text mb-2">No providers found</h3></div>)}<div className="mt-16 text-center bg-white rounded-sm border border-gray-100 p-10"><h3 className="font-display text-2xl font-bold text-brand-forest mb-3">Are You a Service Provider?</h3><p className="text-brand-muted font-body mb-6 max-w-md mx-auto">Apply to become an approved vendor for the Lakefront Estates community.</p><Link href="/apply?type=provider" className="btn-primary text-xs">Apply as a Provider</Link></div></div></section>
  </>);
}
