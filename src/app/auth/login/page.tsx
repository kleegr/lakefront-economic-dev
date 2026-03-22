'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Mail, Phone, ArrowRight, Shield, Briefcase, User } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const [step, setStep] = useState<'choose'|'credentials'|'otp'>('choose');
  const [portalType, setPortalType] = useState<'applicant'|'employer'|'admin'>('applicant');
  const [method, setMethod] = useState<'email'|'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSendOTP = async () => {
    setLoading(true); setError('');
    try {
      if (method === 'email') {
        const { error: e } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: { data: { portal_type: portalType, role: portalType === 'admin' ? 'admin' : portalType } }
        });
        if (e) throw e;
      } else {
        const { error: e } = await supabase.auth.signInWithOtp({
          phone: identifier,
          options: { data: { portal_type: portalType, role: portalType === 'admin' ? 'admin' : portalType } }
        });
        if (e) throw e;
      }
      setMessage('Code sent! Check your ' + (method === 'email' ? 'email inbox' : 'phone') + '.');
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError('');
    try {
      const params = method === 'email'
        ? { email: identifier, token: otp, type: 'email' as const }
        : { phone: identifier, token: otp, type: 'sms' as const };
      const { error: e } = await supabase.auth.verifyOtp(params);
      if (e) throw e;
      const dest = portalType === 'admin' ? '/portal/dashboard' : portalType === 'employer' ? '/employer/dashboard' : '/applicant/dashboard';
      router.push(redirect !== '/' ? redirect : dest);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
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

          {step === 'choose' && (
            <div className="space-y-4">
              <p className="text-sm font-body text-brand-muted text-center mb-4">I am signing in as:</p>
              {[
                { type: 'applicant' as const, icon: User, label: 'Job Seeker / Resident', desc: 'Apply for jobs and manage your profile' },
                { type: 'employer' as const, icon: Briefcase, label: 'Employer / Business', desc: 'Post jobs and manage your business' },
                { type: 'admin' as const, icon: Shield, label: 'Staff / Admin', desc: 'Lakefront team administration' },
              ].map(opt => (
                <button key={opt.type} onClick={() => { setPortalType(opt.type); setStep('credentials'); }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-brand-gold hover:shadow-md ${
                    portalType === opt.type ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center"><opt.icon className="w-5 h-5 text-brand-sage" /></div>
                    <div><div className="font-display font-semibold text-brand-forest text-sm">{opt.label}</div><div className="text-xs font-body text-brand-muted">{opt.desc}</div></div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'credentials' && (
            <div className="space-y-4">
              <button onClick={() => setStep('choose')} className="text-xs font-body text-brand-muted hover:text-brand-forest">&larr; Back</button>
              <div className="flex gap-2">
                <button onClick={() => setMethod('email')} className={`flex-1 py-2 px-3 rounded text-xs font-body font-semibold transition-all ${method === 'email' ? 'bg-brand-forest text-white' : 'bg-gray-100 text-brand-muted'}`}><Mail className="w-3.5 h-3.5 inline mr-1" />Email</button>
                <button onClick={() => setMethod('phone')} className={`flex-1 py-2 px-3 rounded text-xs font-body font-semibold transition-all ${method === 'phone' ? 'bg-brand-forest text-white' : 'bg-gray-100 text-brand-muted'}`}><Phone className="w-3.5 h-3.5 inline mr-1" />Phone</button>
              </div>
              <input type={method === 'email' ? 'email' : 'tel'} value={identifier} onChange={e => setIdentifier(e.target.value)}
                placeholder={method === 'email' ? 'your@email.com' : '+1 (555) 000-0000'}
                className="input-field" />
              <button onClick={handleSendOTP} disabled={loading || !identifier}
                className="btn-primary w-full disabled:opacity-50">{loading ? 'Sending...' : 'Send One-Time Code'}</button>
              <p className="text-xs text-brand-muted font-body text-center">We&apos;ll send a secure login code to your {method}</p>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <button onClick={() => setStep('credentials')} className="text-xs font-body text-brand-muted hover:text-brand-forest">&larr; Change {method}</button>
              <p className="text-sm font-body text-brand-text">Enter the 6-digit code sent to <strong>{identifier}</strong></p>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="000000" maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em] font-mono" />
              <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                className="btn-primary w-full disabled:opacity-50">{loading ? 'Verifying...' : 'Verify & Sign In'} <ArrowRight className="w-4 h-4 ml-2" /></button>
              <button onClick={handleSendOTP} className="text-xs font-body text-brand-sage hover:text-brand-forest w-full text-center">Resend code</button>
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
