'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Set session cookie from response
      if (data.redirectTo) {
        router.push(data.redirectTo);
      } else {
        router.push('/portal/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600"><span>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</span></button>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading || !email || !password} className="btn-primary w-full disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4 ml-2" /></button>
            <p className="text-xs text-brand-muted font-body text-center">Access is by invitation only.<br/>Contact your administrator if you need access.</p>
          </div>
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
