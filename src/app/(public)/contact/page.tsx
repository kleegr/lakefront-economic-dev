'use client';
import { useState } from 'react';
import { MovingBanner } from '@/components/public/MovingBanner';
import { ScrollReveal } from '@/components/public/ScrollReveal';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <MovingBanner page="contact" title="Contact Us" badge="Get in Touch" subtitle="We'd love to hear from you. Reach out for inquiries, tours, or opportunities." />
      <div className="bg-[#FAFAF7] py-16">
        <div className="max-container section-padding">
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              <ScrollReveal>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <Mail className="w-6 h-6 text-brand-forest mb-3" />
                  <h3 className="font-display font-semibold text-brand-forest mb-1">Email</h3>
                  <p className="text-sm font-body text-gray-500">info@lakefrontestates.com</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <Phone className="w-6 h-6 text-brand-forest mb-3" />
                  <h3 className="font-display font-semibold text-brand-forest mb-1">Phone</h3>
                  <p className="text-sm font-body text-gray-500">(863) 555-0100</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <MapPin className="w-6 h-6 text-brand-forest mb-3" />
                  <h3 className="font-display font-semibold text-brand-forest mb-1">Address</h3>
                  <p className="text-sm font-body text-gray-500">Lakefront Estates<br />Okeechobee, FL 34974</p>
                </div>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-2">
              <ScrollReveal delay={100}>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" /><h2 className="font-display text-xl font-semibold text-green-800 mb-2">Message Sent!</h2><p className="text-sm text-green-600 font-body">We'll get back to you within 1-2 business days.</p></div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 p-8">
                    <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#2C3E2D' }}>Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                        <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                      </div>
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Subject</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A]" /></div>
                      <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Message *</label><textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-[#C9B97A] resize-none" /></div>
                      <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-semibold text-white hover:shadow-lg transition-all" style={{ backgroundColor: '#C9B97A' }}>Send Message <Send className="w-4 h-4" /></button>
                    </form>
                  </div>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
