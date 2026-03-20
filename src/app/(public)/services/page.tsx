'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, Wrench, Thermometer, TreePine, Bug, Waves, Home, Paintbrush, Truck, Package, Monitor, Sparkles, KeyRound, ChefHat, Car, HardHat, ArrowRight, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react';
import { serviceOpportunities, type ServiceOpportunity } from '@/lib/mock-data';

const ICONS: Record<string, typeof Zap> = { Zap, Wrench, Thermometer, TreePine, Bug, Waves, Home, Paintbrush, Truck, Package, Monitor, Sparkles, KeyRound, ChefHat, Car, HardHat };

const STATUS_CONFIG = {
  needed: { label:'Providers Needed', color:'text-red-600 bg-red-50', icon:AlertCircle },
  covered: { label:'Covered', color:'text-green-600 bg-green-50', icon:CheckCircle },
  partial: { label:'More Needed', color:'text-amber-600 bg-amber-50', icon:MinusCircle },
};

export default function ServicesPage() {
  const [filter, setFilter] = useState<'all'|'needed'|'covered'>('all');
  const filtered = filter === 'all' ? serviceOpportunities : serviceOpportunities.filter(s => filter === 'needed' ? (s.status === 'needed' || s.status === 'partial') : s.status === 'covered');
  const needed = serviceOpportunities.filter(s => s.status === 'needed' || s.status === 'partial').length;

  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Service Providers</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Lakefront Estates needs reliable service providers — electricians, plumbers, movers, and more. See what&apos;s needed and apply to serve the community.</p>
    </div></section>

    <section className="py-6 bg-white border-b border-gray-200 sticky top-[4.5rem] z-30"><div className="max-container section-padding">
      <div className="flex items-center justify-between">
        <p className="text-sm font-body"><span className="font-semibold text-red-600">{needed} services</span> <span className="text-brand-muted">still need providers</span></p>
        <div className="flex gap-2">
          {(['all','needed','covered'] as const).map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-body font-semibold uppercase tracking-wider rounded-sm transition-all ${filter === f ? 'bg-brand-forest text-white' : 'bg-gray-100 text-brand-muted hover:bg-gray-200'}`}>{f === 'all' ? 'All Services' : f === 'needed' ? 'Needed' : 'Covered'}</button>))}
        </div>
      </div>
    </div></section>

    <section className="py-10 lg:py-16 bg-brand-warm min-h-[50vh]"><div className="max-container section-padding">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(svc => {
          const Icon = ICONS[svc.icon] || Wrench;
          const sc = STATUS_CONFIG[svc.status];
          const StatusIcon = sc.icon;
          return (
            <div key={svc.id} className={`bg-white rounded-sm border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md ${svc.status === 'needed' ? 'hover:border-red-200' : svc.status === 'partial' ? 'hover:border-amber-200' : 'hover:border-green-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-sage/10 flex items-center justify-center"><Icon className="w-6 h-6 text-brand-sage" /></div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-body font-semibold rounded-full ${sc.color}`}><StatusIcon className="w-3 h-3" />{sc.label}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-brand-forest mb-1">{svc.name}</h3>
              <p className="text-xs font-body text-brand-gold font-medium uppercase tracking-wider mb-3">{svc.category}</p>
              <p className="text-sm text-brand-muted font-body line-clamp-3 mb-4">{svc.description}</p>
              {svc.providers.length > 0 && <p className="text-xs font-body text-brand-muted mb-3">Current: {svc.providers.join(', ')}</p>}
              {(svc.status === 'needed' || svc.status === 'partial') && <Link href="/apply?type=provider" className="inline-flex items-center gap-1 text-sm font-body font-semibold text-brand-gold hover:text-brand-sage transition-colors">Apply as Provider <ArrowRight className="w-3.5 h-3.5" /></Link>}
            </div>
          );
        })}
      </div>

      <div className="mt-16 bg-brand-forest rounded-sm p-10 text-center"><h3 className="font-display text-2xl font-bold text-white mb-3">Offer a Different Service?</h3><p className="text-white/50 font-body mb-6 max-w-md mx-auto">Even if your service isn&apos;t listed, we welcome all qualified providers. Apply today to join the Lakefront Economy.</p><Link href="/apply?type=provider" className="btn-primary">Apply as a Service Provider</Link></div>
    </div></section>
  </>);
}
