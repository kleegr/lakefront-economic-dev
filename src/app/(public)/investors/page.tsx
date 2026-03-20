'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, DollarSign, Building2, MapPin, Users, Send, Shield, TrendingUp, BarChart3, Globe } from 'lucide-react';
export default function InvestorsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({firstName:'',lastName:'',email:'',phone:'',companyName:'',investmentInterest:'',investmentRange:'',message:''});
  return (<>
    <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding">
      <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Lakefront Economy</p>
      <h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Invest in the Lakefront Economy</h1>
      <p className="text-lg text-white/60 font-body max-w-2xl">Join one of Florida&apos;s most promising community developments. The Lakefront Economy offers ground-floor opportunities in commercial real estate, retail, and community infrastructure.</p>
    </div></section>

    <section className="py-16 lg:py-24 bg-white"><div className="max-container section-padding">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Why Invest</p>
          <h2 className="font-display text-3xl font-bold text-brand-forest mb-6">The Lakefront Economy Advantage</h2>
          <p className="text-brand-text/60 font-body leading-relaxed mb-8">Lakefront Estates represents a ground-floor opportunity in a 550-acre master-planned community in Okeechobee, Florida. The Lakefront Economy is designed to be self-sustaining, with built-in demand from a growing residential community.</p>
          <div className="space-y-4">{[{icon:MapPin,text:'Strategic location \u2014 90 minutes from Palm Beach and Orlando'},{icon:DollarSign,text:'Florida advantage \u2014 zero state income tax'},{icon:Building2,text:'62,000+ sqft of retail and office space in development'},{icon:Users,text:'Built-in demand from a growing residential community'},{icon:Shield,text:'Transparent development with institutional-grade planning'},{icon:TrendingUp,text:'Growing Lakefront Economy with essential businesses needed'},{icon:Globe,text:'Diverse investment opportunities across multiple sectors'}].map(item => (<div key={item.text} className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0 mt-0.5"><item.icon className="w-4 h-4 text-brand-sage" /></div><p className="text-sm font-body text-brand-text/60">{item.text}</p></div>))}</div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[{value:'550',label:'Total Acres'},{value:'62K+',label:'Retail SqFt'},{value:'18+',label:'Business Slots'},{value:'16+',label:'Service Categories'}].map(s => (<div key={s.label} className="bg-brand-cream rounded-sm p-6 text-center"><div className="text-2xl font-display font-bold text-brand-forest">{s.value}</div><div className="text-xs font-body text-brand-muted mt-1">{s.label}</div></div>))}
          </div>
          <div className="bg-brand-forest/5 rounded-sm p-6"><h3 className="font-display text-base font-semibold text-brand-forest mb-3">Lakefront Economy Sectors</h3><div className="space-y-2">{['Commercial Real Estate','Retail & Shopping','Community Infrastructure','Healthcare Facilities','Food & Beverage','Professional Services','Education Facilities'].map(area => (<div key={area} className="flex items-center gap-2 text-sm font-body text-brand-text/60"><CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />{area}</div>))}</div></div>
        </div>
      </div>
    </div></section>

    <section className="py-16 lg:py-24 bg-brand-warm"><div className="max-container section-padding"><div className="max-w-2xl mx-auto">
      {submitted ? (<div className="text-center py-12"><div className="w-16 h-16 rounded-full bg-brand-sage/10 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-brand-sage" /></div><h2 className="font-display text-2xl font-bold text-brand-forest mb-3">Inquiry Received</h2><p className="text-brand-muted font-body mb-8">Our Lakefront Economy investment team will be in touch shortly.</p><Link href="/" className="btn-secondary text-xs">Back to Home</Link></div>) : (<>
        <div className="text-center mb-10"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-3">Lakefront Economy</p><h2 className="font-display text-3xl font-bold text-brand-forest mb-3">Investor Inquiry</h2><p className="text-brand-muted font-body">Share your investment interests and our team will schedule a discussion.</p></div>
        <form onSubmit={e => {e.preventDefault(); setSubmitted(true);}} className="bg-white rounded-sm border border-gray-100 p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">First Name *</label><input required type="text" value={form.firstName} onChange={e => setForm({...form,firstName:e.target.value})} className="input-field" /></div><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Last Name *</label><input required type="text" value={form.lastName} onChange={e => setForm({...form,lastName:e.target.value})} className="input-field" /></div></div>
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} className="input-field" /></div><div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Phone</label><input type="tel" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} className="input-field" /></div></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Company</label><input type="text" value={form.companyName} onChange={e => setForm({...form,companyName:e.target.value})} className="input-field" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Investment Interest *</label><select required value={form.investmentInterest} onChange={e => setForm({...form,investmentInterest:e.target.value})} className="input-field"><option value="">Select an area</option><option value="commercial">Commercial Real Estate</option><option value="retail">Retail & Shopping</option><option value="infrastructure">Community Infrastructure</option><option value="healthcare">Healthcare Facilities</option><option value="food">Food & Beverage</option><option value="other">Other</option></select></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Investment Range</label><select value={form.investmentRange} onChange={e => setForm({...form,investmentRange:e.target.value})} className="input-field"><option value="">Prefer not to say</option><option value="under-100k">Under $100K</option><option value="100k-500k">$100K \u2013 $500K</option><option value="500k-1m">$500K \u2013 $1M</option><option value="1m-5m">$1M \u2013 $5M</option><option value="5m-plus">$5M+</option></select></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Message</label><textarea rows={4} value={form.message} onChange={e => setForm({...form,message:e.target.value})} className="input-field" placeholder="Tell us about your investment goals..." /></div>
          <button type="submit" className="btn-primary"><Send className="w-4 h-4 mr-2" /> Submit Inquiry</button>
        </form>
      </>)}
    </div></div></section>
  </>);
}
