'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Store, CheckCircle, Send } from 'lucide-react';
import Link from 'next/link';

export default function BusinessApplyPage() {
  const [f, setF] = useState({name:'',email:'',phone:'',bizName:'',concept:'',category:'',readyToInvest:false,investAmt:'',spaceIntent:'',jobs:'',y1:'',y2:'',y3:'',rationale:'',context:''});
  const [submitting, setSubmitting] = useState(false); const [done, setDone] = useState(false);
  const u = (k:string,v:unknown) => setF(prev=>({...prev,[k]:v}));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const supabase = createClient();
    await supabase.from('lf_business_applications').insert({
      contact_name:f.name, contact_email:f.email, contact_phone:f.phone||null,
      business_name:f.bizName, business_concept:f.concept, business_category:f.category||null,
      ready_to_invest:f.readyToInvest, investment_amount:f.investAmt||null,
      space_intent:f.spaceIntent||null, expected_jobs_created:parseInt(f.jobs)||null,
      year1_projection:f.y1||null, year2_projection:f.y2||null, year3_projection:f.y3||null,
      projection_rationale:f.rationale||null, additional_context:f.context||null,
    });
    setSubmitting(false); setDone(true);
  };

  if (done) return (
    <><section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><h1 className="font-display text-3xl lg:text-5xl font-bold text-white">Application Received</h1></div></section>
      <section className="py-20 bg-brand-warm"><div className="max-w-md mx-auto text-center px-4"><CheckCircle className="w-16 h-16 text-brand-sage mx-auto mb-6" /><h2 className="font-display text-2xl font-bold text-brand-forest mb-3">Thank You</h2><p className="text-brand-muted font-body mb-8">We&apos;ll review your business application and reach out soon.</p><Link href="/" className="btn-primary text-xs">Back to Home</Link></div></section></>
  );

  return (
    <><section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Business Opportunity</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Open a Business at Lakefront</h1><p className="text-lg text-white/60 font-body max-w-xl">Apply for a storefront, office, or commercial space in our growing community.</p></div></section>
      <section className="py-12 lg:py-20 bg-brand-warm"><div className="max-w-2xl mx-auto section-padding">
        <div className="bg-white rounded-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-display text-lg font-semibold text-brand-forest">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Your Name *</label><input required value={f.name} onChange={e=>u('name',e.target.value)} className="input-field" /></div>
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Email *</label><input required type="email" value={f.email} onChange={e=>u('email',e.target.value)} className="input-field" /></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Phone</label><input type="tel" value={f.phone} onChange={e=>u('phone',e.target.value)} className="input-field" /></div>
            <h3 className="font-display text-lg font-semibold text-brand-forest pt-4">Business Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Business Name *</label><input required value={f.bizName} onChange={e=>u('bizName',e.target.value)} className="input-field" /></div>
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Category</label><select value={f.category} onChange={e=>u('category',e.target.value)} className="input-field"><option value="">Select</option><option>Retail</option><option>Food & Beverage</option><option>Healthcare</option><option>Professional Services</option><option>Education</option><option>Other</option></select></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Business Concept *</label><textarea required rows={3} value={f.concept} onChange={e=>u('concept',e.target.value)} className="input-field" placeholder="Describe your business idea..." /></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Space / Storefront Intent</label><input value={f.spaceIntent} onChange={e=>u('spaceIntent',e.target.value)} className="input-field" placeholder="e.g. 1,500 sqft retail, office suite..." /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="flex items-center gap-2"><input type="checkbox" checked={f.readyToInvest} onChange={e=>u('readyToInvest',e.target.checked)} className="rounded" /><span className="text-sm font-body">Ready to invest</span></label></div>
              {f.readyToInvest && <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Investment Amount</label><input value={f.investAmt} onChange={e=>u('investAmt',e.target.value)} className="input-field" placeholder="$" /></div>}
            </div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Expected Jobs Created</label><input type="number" value={f.jobs} onChange={e=>u('jobs',e.target.value)} className="input-field" placeholder="Approximate number" /></div>
            <h3 className="font-display text-lg font-semibold text-brand-forest pt-4">Projections</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Year 1</label><input value={f.y1} onChange={e=>u('y1',e.target.value)} className="input-field" placeholder="Revenue / goals" /></div>
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Year 2</label><input value={f.y2} onChange={e=>u('y2',e.target.value)} className="input-field" placeholder="Revenue / goals" /></div>
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Year 3</label><input value={f.y3} onChange={e=>u('y3',e.target.value)} className="input-field" placeholder="Revenue / goals" /></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Projection Rationale</label><textarea rows={3} value={f.rationale} onChange={e=>u('rationale',e.target.value)} className="input-field" placeholder="Explain the basis for your projections..." /></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Additional Context</label><textarea rows={2} value={f.context} onChange={e=>u('context',e.target.value)} className="input-field" placeholder="Anything else we should know..." /></div>
            <p className="text-xs text-brand-muted font-body">Your application will be reviewed by our team. All submissions are subject to approval.</p>
            <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50"><Send className="w-4 h-4 mr-2" />{submitting?'Submitting...':'Submit Application'}</button>
          </form>
        </div>
      </div></section></>
  );
}
