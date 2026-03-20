'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Building2, ArrowRight, Tag } from 'lucide-react';
import { mockBusinesses } from '@/lib/mock-data';
import { formatEnum } from '@/lib/utils';
import type { BusinessCategory } from '@/types';
const CATEGORIES: BusinessCategory[] = ['retail','food-beverage','professional-services','healthcare','education','religious','community','other'];
export default function BusinessesPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const filtered = useMemo(() => mockBusinesses.filter(b => {
    if (!b.isPublic) return false;
    if (query) { const q = query.toLowerCase(); if (!b.name.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false; }
    if (selectedCategory && b.category !== selectedCategory) return false;
    return true;
  }), [query, selectedCategory]);
  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Directory</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Business Directory</h1><p className="text-lg text-white/60 font-body max-w-xl">Explore the businesses and services that make up the Lakefront community.</p></div></section>
    <section className="sticky top-20 z-30 bg-white border-b border-gray-200 shadow-sm"><div className="max-container section-padding py-4"><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search businesses..." value={query} onChange={e => setQuery(e.target.value)} className="input-field pl-11 py-2.5 text-sm" /></div><select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field py-2.5 text-sm sm:w-56"><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{formatEnum(c)}</option>)}</select></div></div></section>
    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding"><p className="text-sm font-body text-brand-muted mb-6"><span className="font-semibold text-brand-text">{filtered.length}</span> business{filtered.length !== 1 ? 'es' : ''} listed</p>{filtered.length > 0 ? (<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(biz => (<div key={biz.id} className="card-public p-6 flex flex-col"><div className="flex items-start gap-4 mb-4"><div className="w-12 h-12 rounded-sm bg-brand-forest/5 flex items-center justify-center shrink-0"><Building2 className="w-6 h-6 text-brand-sage" /></div><div className="min-w-0"><h3 className="font-display text-lg font-semibold text-brand-forest truncate">{biz.name}</h3><span className="inline-block px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-xs font-body font-medium rounded-sm mt-1">{formatEnum(biz.category)}</span></div></div><p className="text-sm text-brand-muted font-body line-clamp-3 mb-4 flex-1">{biz.description}</p>{biz.tags && biz.tags.length > 0 && (<div className="flex flex-wrap gap-1 mb-4">{biz.tags.slice(0,3).map(tag => (<span key={tag} className="flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-xs font-body text-brand-muted rounded-sm"><Tag className="w-2.5 h-2.5" />{tag}</span>))}</div>)}<div className="pt-4 border-t border-gray-100"><span className="text-sm font-body font-semibold text-brand-sage flex items-center gap-1 cursor-pointer hover:text-brand-forest transition-colors">View Details <ArrowRight className="w-3.5 h-3.5" /></span></div></div>))}</div>) : (<div className="text-center py-20"><Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="font-display text-xl font-semibold text-brand-text mb-2">No businesses found</h3></div>)}<div className="mt-16 text-center bg-white rounded-sm border border-gray-100 p-10"><h3 className="font-display text-2xl font-bold text-brand-forest mb-3">Interested in Opening a Business?</h3><p className="text-brand-muted font-body mb-6 max-w-md mx-auto">Lakefront Estates has retail, office, and commercial spaces available.</p><Link href="/apply?type=business" className="btn-primary text-xs">Apply for a Storefront</Link></div></div></section>
  </>);
}
