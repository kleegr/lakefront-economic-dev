'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewBusinessPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => { setSaving(false); alert('Business saved! (Demo mode \u2014 connect Kleegr CRM for live data)'); router.push('/portal/businesses'); }, 500);
  }
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/portal/businesses" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft className="w-4 h-4 text-gray-500" /></Link>
          <div><h1 className="text-2xl font-display font-bold text-brand-text">Add Business</h1><p className="text-sm font-body text-brand-muted mt-0.5">Register a new business in the Lakefront Economy directory.</p></div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save'}</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-portal p-6 space-y-5">
          <h2 className="text-base font-display font-semibold text-brand-text">Business Information</h2>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Business Name *</label><input required type="text" className="input-portal" placeholder="e.g., Lakefront Supermarket" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Category *</label><select required className="input-portal"><option value="">Select category</option><option value="retail">Retail</option><option value="food-beverage">Food & Beverage</option><option value="healthcare">Healthcare</option><option value="education">Education</option><option value="professional">Professional Services</option><option value="other">Other</option></select></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Status</label><select className="input-portal"><option value="inquiry">Inquiry</option><option value="approved">Approved</option><option value="active">Active</option></select></div>
          </div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Description</label><textarea rows={4} className="input-portal" placeholder="Business description..." /></div>
        </div>
        <div className="card-portal p-6 space-y-5">
          <h2 className="text-base font-display font-semibold text-brand-text">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Contact Name</label><input type="text" className="input-portal" /></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Email</label><input type="email" className="input-portal" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Phone</label><input type="tel" className="input-portal" /></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Website</label><input type="url" className="input-portal" placeholder="https://" /></div>
          </div>
        </div>
        <div className="flex items-center gap-3"><button type="submit" disabled={saving} className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Business'}</button><Link href="/portal/businesses" className="px-5 py-2.5 text-sm font-body font-medium text-brand-muted hover:text-brand-text transition-colors">Cancel</Link></div>
      </form>
    </div>
  );
}
