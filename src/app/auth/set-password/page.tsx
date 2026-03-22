'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';

function SetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleSetPassword = async () => {
    if (!isValid) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to set password');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set password');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen bg-brand-forest flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="font-display text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
        <p className="text-sm font-body text-brand-muted">This invitation link is invalid or has expired.</p>
        <Link href="/auth/login" className="btn-primary mt-6 inline-flex">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white">Set Your Password</h1>
          <p className="text-white/50 font-body text-sm mt-2">Create a secure password to activate your account</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-body">{error}</div>}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-brand-forest text-lg mb-2">Password Set!</h3>
              <p className="text-sm font-body text-brand-muted">Your account is now active. Redirecting to login...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-body font-semibold text-brand-text uppercase tracking-wider block mb-1.5">New Password</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {password && password.length < 8 && <p className="text-xs text-red-500 font-body mt-1">Must be at least 8 characters</p>}
              </div>
              <div>
                <label className="text-xs font-body font-semibold text-brand-text uppercase tracking-wider block mb-1.5">Confirm Password</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-brand-sage/30">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" onKeyDown={e => e.key === 'Enter' && isValid && handleSetPassword()} />
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500 font-body mt-1">Passwords do not match</p>}
              </div>
              <button onClick={handleSetPassword} disabled={loading || !isValid} className="btn-primary w-full disabled:opacity-50">{loading ? 'Setting up...' : 'Activate Account'} <ArrowRight className="w-4 h-4 ml-2" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-brand-forest" />}><SetPasswordForm /></Suspense>;
}
