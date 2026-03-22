'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Supabase will have set the session from the reset link hash fragment
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check if already in a session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setSessionReady(true);
    });
  }, []);

  const isValid = password.length >= 8 && password === confirmPassword;

  const handleReset = async () => {
    if (!isValid) return;
    setLoading(true); setError('');
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;
      // Also update profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('lf_profiles').update({ password_set: true }).eq('id', user.id);
      }
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-white/50 font-body text-sm mt-2">Create a new password for your account</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-body">{error}</div>}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-brand-forest text-lg mb-2">Password Reset!</h3>
              <p className="text-sm font-body text-brand-muted">Redirecting to login...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-sm font-body text-brand-muted">Verifying your reset link...</p>
              <Link href="/auth/login" className="text-xs font-body text-brand-sage hover:text-brand-forest mt-4 block">Back to Login</Link>
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
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="flex-1 font-body text-brand-text placeholder:text-gray-400 outline-none bg-transparent" onKeyDown={e => e.key === 'Enter' && isValid && handleReset()} />
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500 font-body mt-1">Passwords do not match</p>}
              </div>
              <button onClick={handleReset} disabled={loading || !isValid} className="btn-primary w-full disabled:opacity-50">{loading ? 'Resetting...' : 'Reset Password'} <ArrowRight className="w-4 h-4 ml-2" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen bg-brand-forest" />}><ResetPasswordForm /></Suspense>;
}
