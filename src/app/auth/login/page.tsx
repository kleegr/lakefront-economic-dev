'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed');
        return;
      }
      if (data.redirectTo) router.push(data.redirectTo);
      else router.push('/portal/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    setLoading(true); setError('');
    try {
      // Use Supabase native password reset — sends email through Supabase Auth
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        { redirectTo: `${window.location.origin}/auth/reset-password` }
      );
      if (resetErr) throw resetErr;
      setForgotSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white">Portal Login</h1>
          <p className="text-white/50 font-body text-sm mt-2">Sign in to access your portal</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-body">{error}</div>}

          {forgotMode ? (
            forgotSent ? (
              <div className="text-center py-6">
                <Mail className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="font-display font-bold text-brand-forest text-lg mb-2">Check Your Email</h3>
                <p className="text-sm font-body text-brand-muted">If an account exists for <strong>{email}</strong>, we sent a password reset link to that email.</p>
                <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="text-sm font-body text-brand-sage hover:text-brand-forest mt-4">&larr; Back to Login</button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-brand-forest text-center">Reset Password</h3>
                <p className="text-xs font-body text-brand-muted text-center">Enter your email and we&apos;ll send a password reset link.</p>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" onKeyDown={e => e.key === 'Enter' && email && handleForgotPassword()} />
                </div>
                <button onClick={handleForgotPassword} disabled={loading || !email} className="btn-primary w-full disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                <button onClick={() => setForgotMode(false)} className="text-sm font-body text-brand-sage hover:text-brand-forest w-full text-center">&larr; Back to Login</button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-body font-semibold text-brand-text uppercase tracking-wider block mb-1.5">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30 focus-within:border-brand-sage">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" onKeyDown={e => e.key === 'Enter' && password && handleLogin()} />
                </div>
              </div>
              <div>
                <label className="text-xs font-body font-semibold text-brand-text uppercase tracking-wider block mb-1.5">Password</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30 focus-within:border-brand-sage">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" onKeyDown={e => e.key === 'Enter' && email && handleLogin()} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setForgotMode(true)} className="text-xs font-body text-brand-sage hover:text-brand-forest">Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={loading || !email || !password} className="btn-primary w-full disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" /></button>
              <p className="text-xs text-brand-muted font-body text-center">Access is by invitation only.</p>
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
