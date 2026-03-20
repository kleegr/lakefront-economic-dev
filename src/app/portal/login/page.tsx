'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function PortalLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen gradient-forest flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-display text-3xl font-bold text-white">Lakefront</span>
            <p className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold mt-0.5">Economic Development Portal</p>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="font-display text-xl font-bold text-brand-text mb-1">Sign In</h1>
          <p className="text-sm font-body text-brand-muted mb-6">Access the internal operations portal.</p>
          <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/portal/dashboard'; }} className="space-y-5">
            <div>
              <label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required type="email" className="input-portal pl-11" placeholder="you@lakefrontdev.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required type={showPassword ? 'text' : 'password'} className="input-portal pl-11 pr-11" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-portal w-full justify-center">Sign In</button>
          </form>
          <p className="text-xs text-center text-brand-muted font-body mt-6">Access restricted to authorized staff only.</p>
        </div>
      </div>
    </div>
  );
}
