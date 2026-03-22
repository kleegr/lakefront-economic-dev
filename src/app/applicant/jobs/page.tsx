'use client';
import Link from 'next/link';
export default function ApplicantJobsPage() {
  return <div><h1 className="font-display text-2xl font-bold text-brand-forest mb-4">Browse Jobs</h1><p className="text-sm font-body text-brand-muted mb-6">Explore open positions in the Lakefront Economy.</p><Link href="/jobs" className="btn-primary text-xs">View Public Jobs Board</Link></div>;
}
