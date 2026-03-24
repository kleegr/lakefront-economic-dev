'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, ArrowRight, Search } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';

// ITEM 8: Banner on services page
// ITEM 29: "Apply as Provider" button links to application
export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/services').then(r => r.json()).then(d => { setServices(d.items || []); setLoading(false); }); }, []);
  const filtered = services.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="gradient-forest relative overflow-hidden"><div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} /><div className="max-container section-padding py-20 relative z-10"><ScrollReveal><div className="text-center"><p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Community</p><h1 className="font-display text-3xl lg:text-4xl font-bold text-white">Service Providers</h1><div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} /><p className="text-base text-white/50 font-body max-w-lg mx-auto">Trusted service providers serving Lakefront Estates.</p></div></ScrollReveal></div></div>
      <div className="bg-[#FAFAF7] py-16"><div className="max-container section-padding">
        <div className="flex gap-4 mb-8 items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div><Link href="/apply/provider" className="px-6 py-3 rounded-full text-sm font-body font-semibold text-white shrink-0" style={{ backgroundColor: '#C9B97A' }}>Apply as Provider</Link></div>
        {loading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full mx-auto" /></div> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map((s, i) => (<ScrollReveal key={s.id} delay={i * 80}><div className="bg-white rounded-xl border border-gray-100 p-6 hover-lift"><div className="flex items-center gap-2 mb-3"><Wrench className="w-5 h-5 text-brand-forest" /><span className="text-xs font-body font-semibold uppercase tracking-wider text-gray-400">{s.category}</span></div><h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}>{s.name}</h3><p className="text-sm text-gray-500 font-body mb-1">{s.provider_name}</p>{s.description && <p className="text-xs text-gray-400 font-body mb-3">{s.description}</p>}<Link href="/contact" className="inline-flex items-center gap-1 text-sm font-body font-semibold hover:gap-2 transition-all" style={{ color: '#C9B97A' }}>Contact <ArrowRight className="w-4 h-4" /></Link></div></ScrollReveal>))}{filtered.length === 0 && <div className="col-span-3 text-center py-12"><p className="text-gray-400 font-body">No providers found.</p></div>}</div>
        )}
      </div></div>
    </div>
  );
}
