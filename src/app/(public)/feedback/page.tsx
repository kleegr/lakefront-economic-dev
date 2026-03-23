'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, CheckCircle, Send } from 'lucide-react';
import Link from 'next/link';

const TYPES = [{v:'suggestion',l:'Suggestion'},{v:'comment',l:'Comment'},{v:'idea',l:'Idea'},{v:'feedback',l:'General Feedback'}];

export default function FeedbackPage() {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [type, setType] = useState('suggestion'); const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false); const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!message) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from('lf_suggestions').insert({ name: name||null, email: email||null, type, message });
    setSubmitting(false); setDone(true);
  };

  if (done) return (
    <><section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><h1 className="font-display text-3xl lg:text-5xl font-bold text-white">Thank You</h1></div></section>
      <section className="py-20 bg-brand-warm"><div className="max-w-md mx-auto text-center px-4"><CheckCircle className="w-16 h-16 text-brand-sage mx-auto mb-6" /><h2 className="font-display text-2xl font-bold text-brand-forest mb-3">Feedback Received</h2><p className="text-brand-muted font-body mb-8">Our team will review your submission. Thank you for helping us improve.</p><Link href="/" className="btn-primary text-xs">Back to Home</Link></div></section></>
  );

  return (
    <><section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Community</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Share Your Feedback</h1><p className="text-lg text-white/60 font-body max-w-xl">We value your suggestions, ideas, and comments about the Lakefront community.</p></div></section>
      <section className="py-12 lg:py-20 bg-brand-warm"><div className="max-w-2xl mx-auto section-padding">
        <div className="bg-white rounded-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="input-field" placeholder="Optional" /></div>
              <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input-field" placeholder="Optional" /></div>
            </div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Type</label><select value={type} onChange={e=>setType(e.target.value)} className="input-field">{TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
            <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Your Message *</label><textarea required rows={5} value={message} onChange={e=>setMessage(e.target.value)} className="input-field" placeholder="Share your thoughts..." /></div>
            <p className="text-xs text-brand-muted font-body">Your submission will be reviewed by our team and will not be published publicly.</p>
            <button type="submit" disabled={submitting||!message} className="btn-primary disabled:opacity-50"><Send className="w-4 h-4 mr-2" />{submitting?'Submitting...':'Submit Feedback'}</button>
          </form>
        </div>
      </div></section></>
  );
}
