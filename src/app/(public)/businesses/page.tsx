'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Stethoscope, Coffee, Shirt, Hammer, Baby, Fuel, Landmark, Shield, Calculator, Scale, Smile, ShoppingBag, Pizza, Gift, Dumbbell, UtensilsCrossed, Check, X, Clock, ArrowRight, Pill } from 'lucide-react';
import { businessOpportunities, type BusinessOpportunity } from '@/lib/mock-data';

const ICONS: Record<string, typeof ShoppingCart> = { ShoppingCart, Stethoscope, Coffee, Shirt, Hammer, Baby, Fuel, Landmark, Shield, Calculator, Scale, Smile, ShoppingBag, Pizza, Gift, Dumbbell, UtensilsCrossed, Pill };

const STATUS_CONFIG = {
  available: { label:'Available', color:'bg-green-50 text-green-700 border-green-200', dot:'bg-green-500' },
  taken: { label:'Taken', color:'bg-gray-100 text-gray-500 border-gray-200', dot:'bg-gray-400' },
  'coming-soon': { label:'Coming Soon', color:'bg-amber-50 text-amber-700 border-amber-200', dot:'bg-amber-500' },
};

export default function BusinessesPage() {
  const [filter, setFilter] = useState<'all'|'available'|'taken'>('all');
  const filtered = filter === 'all' ? businessOpportunities : businessOpportunities.filter(b => b.status === filter);
  const available = businessOpportunities.filter(b => b.status === 'available').length;
  const taken = businessOpportunities.filter(b => b.status === 'taken').length;

  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Business Opportunities</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Lakefront Estates is a new development with essential businesses and stores that the community needs. See what opportunities are available and apply to open yours.</p>
    </div></section>

    <section className="py-6 bg-white border-b border-gray-200 sticky top-[4.5rem] z-30"><div className="max-container section-padding">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-sm font-body font-medium text-brand-text">{available} Available</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-400" /><span className="text-sm font-body font-medium text-brand-text">{taken} Taken</span></div>
        </div>
        <div className="flex gap-2">
          {(['all','available','taken'] as const).map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider rounded-sm transition-all ${filter === f ? 'bg-brand-forest text-white' : 'bg-gray-100 text-brand-muted hover:bg-gray-200'}`}>{f === 'all' ? 'All' : f === 'available' ? 'Available' : 'Taken'}</button>))}
        </div>
      </div>
    </div></section>

    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(biz => {
          const Icon = ICONS[biz.icon] || ShoppingBag;
          const sc = STATUS_CONFIG[biz.status];
          return (
            <div key={biz.id} className={`bg-white rounded-sm border shadow-sm p-6 transition-all duration-300 ${biz.status === 'available' ? 'border-green-200 hover:shadow-md hover:border-green-300' : 'border-gray-100 opacity-80'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-sage/10 flex items-center justify-center"><Icon className="w-6 h-6 text-brand-sage" /></div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-body font-semibold rounded-full border ${sc.color}`}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-brand-forest mb-1">{biz.name}</h3>
              <p className="text-xs font-body text-brand-gold font-medium uppercase tracking-wider mb-3">{biz.category}</p>
              <p className="text-sm text-brand-muted font-body line-clamp-3 mb-4">{biz.description}</p>
              {biz.status === 'taken' && biz.assignedTo && <p className="text-xs font-body text-brand-muted italic">Operated by: {biz.assignedTo}</p>}
              {biz.status === 'available' && <Link href="/apply?type=business" className="inline-flex items-center gap-1 text-sm font-body font-semibold text-brand-gold hover:text-brand-sage transition-colors">Apply to Open <ArrowRight className="w-3.5 h-3.5" /></Link>}
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-brand-forest rounded-sm p-10 text-center"><h3 className="font-display text-2xl font-bold text-white mb-3">Don&apos;t See Your Business?</h3><p className="text-white/50 font-body mb-6 max-w-md mx-auto">We welcome all types of businesses. Apply today and our Lakefront Economy team will review your proposal.</p><Link href="/apply?type=business" className="btn-primary">Apply to Open a Business</Link></div>
    </div></section>
  </>);
}
