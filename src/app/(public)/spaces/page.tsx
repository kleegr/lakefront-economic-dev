'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Warehouse, Search } from 'lucide-react';
import { MovingBanner } from '@/components/public/MovingBanner';
import { ScrollReveal } from '@/components/public/ScrollReveal';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetch('/api/spaces').then(r => r.json()).then(d => { setSpaces(d.items || []); setLoading(false); }); }, []);
  const filtered = spaces.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.space_type?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <MovingBanner page="spaces" title="Available Spaces" badge="Commercial" subtitle="Find your next commercial or retail space at Lakefront Estates." />
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="flex gap-4 mb-8 items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search spaces..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
            <Link href="/apply/space" className="px-6 py-3 rounded-full text-sm font-body font-semibold text-white shrink-0" style={{ backgroundColor: '#C9B97A' }}>Apply for Space</Link>
          </div>
          {loading ? <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#C9B97A] rounded-full mx-auto" /></div> : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((space, i) => (
                <ScrollReveal key={space.id} delay={i * 80}>
                  <div className="bg-white rounded-xl border border-gray-100 p-6 hover-lift">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${space.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{space.status}</span>
                      <span className="text-lg font-display font-bold" style={{ color: '#2C3E2D' }}>{space.price}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}>{space.name}</h3>
                    <p className="text-sm text-gray-400 font-body flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" />{space.location || 'Lakefront Estates'}</p>
                    <div className="flex items-center gap-4 text-xs font-body text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><Warehouse className="w-3 h-3" />{space.space_type}</span>
                      {space.sqft && <span>{space.sqft} sq ft</span>}
                    </div>
                    {space.description && <p className="text-xs text-gray-400 font-body mb-3">{space.description}</p>}
                    <Link href="/apply/space" className="inline-flex items-center gap-1 text-sm font-body font-semibold transition-colors hover:gap-2" style={{ color: '#C9B97A' }}>Inquire <ArrowRight className="w-4 h-4" /></Link>
                  </div>
                </ScrollReveal>
              ))}
              {filtered.length === 0 && <div className="col-span-2 text-center py-12"><p className="text-gray-400 font-body">No spaces found.</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
