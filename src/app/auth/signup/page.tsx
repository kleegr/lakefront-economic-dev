'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle, LogIn } from 'lucide-react';

// SIGNUP PAGE: User enters email, we save to lf_applications, they wait for approval, then get invite email
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_name: name,
          applicant_email: email,
          application_type: role,
          cover_letter: `Sign-up request as ${role}`,
          status: 'submitted',
        }),
      });
      if (res.ok) setSubmitted(true);
      else { const d = await res.json(); setError(d.error || 'Something went wrong'); }
    } catch { setError('Network error'); }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e2d1f 0%, #2C3E2D 50%, #3d5340 100%)' }}>
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold text-white">Lakefront</span>
            <span className="block text-[10px] font-body text-white/40 uppercase tracking-[0.2em]">Estates & Villas</span>
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-brand-forest mb-2">Request Submitted!</h2>
            <p className="text-sm font-body text-gray-500 mb-4">We'll review your request and send you a login link once approved. This usually takes 1-2 business days.</p>
            <p className="text-xs font-body text-gray-400 mb-6">Check your email at <strong>{email}</strong> for the login invitation.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-body font-semibold text-white" style={{ backgroundColor: '#2C3E2D' }}>Back to Home</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold text-brand-forest mb-1">Request Access</h2>
            <p className="text-sm font-body text-gray-400 mb-6">Enter your details below. Once approved, you'll receive an email with your login credentials.</p>

            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg mb-4 font-body">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Full Name *</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" placeholder="John Doe" /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">Email Address *</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage" placeholder="you@email.com" /></div>
              <div><label className="block text-xs font-body font-medium text-gray-500 mb-1 uppercase tracking-wider">I want to...</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-body focus:outline-none focus:border-brand-sage">
                  <option value="employee">Find a Job (Employee)</option>
                  <option value="employer">Post Jobs (Employer)</option>
                  <option value="provider">Offer Services (Provider)</option>
                  <option value="space_rental">Rent a Space</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3 rounded-full text-sm font-body font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ backgroundColor: '#C9B97A' }}>{submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Request Access</>}</button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs font-body text-gray-400 mb-2">Already have an account?</p>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-body font-semibold" style={{ color: '#2C3E2D' }}><LogIn className="w-4 h-4" /> Login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
