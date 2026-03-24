'use client';
import { useState } from 'react';
import { Globe, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';

// ITEM 28: Portal Preview page to see how public site looks
export default function PortalPreviewPage() {
  const [device, setDevice] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [url, setUrl] = useState('/');

  const widths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">Portal Preview</h1><p className="text-sm font-body text-gray-400 mt-1">See how the public site looks to visitors</p></div>
        <a href="/" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-body font-semibold hover:bg-gray-50"><ExternalLink className="w-4 h-4" /> Open in New Tab</a>
      </div>

      <div className="flex items-center gap-4 bg-white rounded-xl border p-3">
        <div className="flex gap-1">
          <button onClick={() => setDevice('desktop')} className={`p-2 rounded-lg ${device === 'desktop' ? 'bg-brand-forest text-white' : 'text-gray-400 hover:bg-gray-100'}`}><Monitor className="w-4 h-4" /></button>
          <button onClick={() => setDevice('tablet')} className={`p-2 rounded-lg ${device === 'tablet' ? 'bg-brand-forest text-white' : 'text-gray-400 hover:bg-gray-100'}`}><Tablet className="w-4 h-4" /></button>
          <button onClick={() => setDevice('mobile')} className={`p-2 rounded-lg ${device === 'mobile' ? 'bg-brand-forest text-white' : 'text-gray-400 hover:bg-gray-100'}`}><Smartphone className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"><Globe className="w-4 h-4 text-gray-300" /><input value={url} onChange={e => setUrl(e.target.value)} className="flex-1 bg-transparent text-sm font-body focus:outline-none" placeholder="/" /></div>
        <div className="flex gap-2">
          {['/', '/jobs', '/spaces', '/services', '/about', '/commercial', '/contact', '/apply/provider', '/apply/space', '/jobs/employer-apply'].map(p => (
            <button key={p} onClick={() => setUrl(p)} className={`px-2 py-1 text-[10px] font-body rounded ${url === p ? 'bg-brand-forest text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{p === '/' ? 'Home' : p.split('/').pop()}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden flex justify-center" style={{ minHeight: '70vh' }}>
        <iframe src={url} className="border-0" style={{ width: widths[device], height: '70vh', maxWidth: '100%' }} title="Site Preview" />
      </div>
    </div>
  );
}
