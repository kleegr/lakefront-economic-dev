'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [step, setStep] = useState<'email'|'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSendOTP = async () => {
    setLoading(true); setError('');
    try {
      // First check if this email is pre-approved / invited
      const res = await fetch('/api/auth/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!data.allowed) {
        setError(data.message || 'This email is not authorized. Contact your administrator to get access.');
        setLoading(false);
        return;
      }

      // Send OTP via Supabase (magic link)
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: true,
          data: { portal_type: data.portal_type || 'applicant', role: data.role || 'applicant' }
        }
      });
      if (e) throw e;
      setMessage('Login link sent! Check your email inbox.');
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send login email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white">Portal Login</h1>
          <p className="text-white/50 font-body text-sm mt-2">Sign in to access your Lakefront Economy portal</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-body">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-body">{message}</div>}

          {step === 'email' && (
            <div className="space-y-4">
              <p className="text-sm font-body text-brand-muted text-center mb-2">Enter your authorized email address</p>
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30 focus-within:border-brand-sage">
                <Mail className="w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent"
                  onKeyDown={e => e.key === 'Enter' && email && handleSendOTP()} />
              </div>
              <button onClick={handleSendOTP} disabled={loading || !email}
                className="btn-primary w-full disabled:opacity-50">{loading ? 'Checking...' : 'Send Login Link'}</button>
              <p className="text-xs text-brand-muted font-body text-center">Only pre-authorized emails can access portals.<br/>Contact your administrator if you need access.</p>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <button onClick={() => { setStep('email'); setMessage(''); }} className="text-xs font-body text-brand-muted hover:text-brand-forest flex items-center gap-1"><ArrowLeft className="w-3 h-3" />Change email</button>
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-display font-semibold text-brand-forest mb-2">Check Your Email</h3>
                <p className="text-sm font-body text-brand-muted">We sent a login link to <strong>{email}</strong></p>
                <p className="text-sm font-body text-brand-muted mt-2">Click the link in the email to sign in.</p>
              </div>
              <button onClick={handleSendOTP} disabled={loading}
                className="text-xs font-body text-brand-sage hover:text-brand-forest w-full text-center">Resend login link</button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm font-body text-white/40 hover:text-white/70 transition-colors">&larr; Back to Website</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-brand-forest" />}><LoginForm /></Suspense>;
}
