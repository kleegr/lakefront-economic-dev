'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Warehouse, Search } from 'lucide-react';
import { ScrollReveal } from '@/components/public/ScrollReveal';

// ITEM 7: Public spaces page to see available spaces for rent
// ITEM 8: Background banner
const SAMPLE_SPACES = [
  { id: '1', name: 'Retail Unit A', type: 'Retail', sqft: '1,200', price: '$2,500/mo', status: 'Available', location: 'Lakefront Plaza, Building A' },
  { id: '2', name: 'Office Suite 201', type: 'Office', sqft: '800', price: '$1,800/mo', status: 'Available', location: 'Lakefront Center, 2nd Floor' },
  { id: '3', name: 'Restaurant Space', type: 'Food Service', sqft: '2,000', price: '$4,200/mo', status: 'Available', location: 'Lakefront Dining Row' },
  { id: '4', name: 'Medical Office', type: 'Healthcare', sqft: '1,500', price: '$3,000/mo', status: 'Coming Soon', location: 'Lakefront Medical Center' },
];

export default function SpacesPage() {
  const [search, setSearch] = useState('');
  const filtered = SAMPLE_SPACES.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* ITEM 8: Banner */}
      <div className="gradient-forest relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="max-container section-padding py-20 relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-xs tracking-[0.3em] uppercase mb-3 font-body font-semibold" style={{ color: '#C9B97A' }}>Commercial</p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white">Available Spaces</h1>
              <div className="w-12 h-[2px] mx-auto mt-4 mb-4" style={{ backgroundColor: '#C9B97A' }} />
              <p className="text-base text-white/50 font-body max-w-lg mx-auto">Find your next commercial or retail space at Lakefront Estates.</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search spaces..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-body focus:outline-none focus:border-[#C9B97A]" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {filtered.map((space, i) => (
              <ScrollReveal key={space.id} delay={i * 80}>
                <div className="bg-white rounded-xl border border-gray-100 p-6 hover-lift">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider ${space.status === 'Available' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{space.status}</span>
                    </div>
                    <span className="text-lg font-display font-bold" style={{ color: '#2C3E2D' }}>{space.price}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1" style={{ color: '#2C3E2D' }}>{space.name}</h3>
                  <p className="text-sm text-gray-400 font-body flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" />{space.location}</p>
                  <div className="flex items-center gap-4 text-xs font-body text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Warehouse className="w-3 h-3" />{space.type}</span>
                    <span>{space.sqft} sq ft</span>
                  </div>
                  <Link href="/apply" className="inline-flex items-center gap-1 text-sm font-body font-semibold transition-colors hover:gap-2" style={{ color: '#C9B97A' }}>Inquire <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
