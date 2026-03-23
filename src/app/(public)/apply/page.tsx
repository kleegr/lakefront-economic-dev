import Link from 'next/link';
import { Briefcase, Store, TrendingUp, Wrench, ArrowRight, Users } from 'lucide-react';

export default function ApplyPage() {
  return (
    <>
      <section className="gradient-forest py-16 lg:py-24"><div className="max-container section-padding"><p className="text-brand-gold font-body font-semibold text-xs tracking-[0.2em] uppercase mb-4">Get Started</p><h1 className="font-display text-3xl lg:text-5xl font-bold text-white mb-4">Apply</h1><p className="text-lg text-white/60 font-body max-w-xl">Join the Lakefront community. Choose the path that fits you best.</p></div></section>
      <section className="py-12 lg:py-20 bg-brand-warm">
        <div className="max-container section-padding">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link href="/auth/login?redirect=/applicant/dashboard" className="card-public p-8 text-center hover:border-brand-sage/30 transition-all group">
              <div className="w-14 h-14 rounded-sm bg-brand-sage/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/20"><Briefcase className="w-7 h-7 text-brand-sage" /></div>
              <h3 className="font-display text-base font-semibold text-brand-forest mb-2">Job Application</h3>
              <p className="text-sm text-brand-muted font-body mb-4">Apply for open positions as a resident</p>
              <span className="text-sm font-body font-semibold text-brand-gold flex items-center justify-center gap-1">Sign In to Apply <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
            <Link href="/auth/login?redirect=/employer/dashboard" className="card-public p-8 text-center hover:border-brand-sage/30 transition-all group">
              <div className="w-14 h-14 rounded-sm bg-brand-sage/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/20"><Store className="w-7 h-7 text-brand-sage" /></div>
              <h3 className="font-display text-base font-semibold text-brand-forest mb-2">Business / Employer</h3>
              <p className="text-sm text-brand-muted font-body mb-4">Post jobs and manage hiring</p>
              <span className="text-sm font-body font-semibold text-brand-gold flex items-center justify-center gap-1">Employer Portal <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
            <Link href="/contact?type=investor" className="card-public p-8 text-center hover:border-brand-sage/30 transition-all group">
              <div className="w-14 h-14 rounded-sm bg-brand-sage/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/20"><TrendingUp className="w-7 h-7 text-brand-sage" /></div>
              <h3 className="font-display text-base font-semibold text-brand-forest mb-2">Investor Inquiry</h3>
              <p className="text-sm text-brand-muted font-body mb-4">Explore investment opportunities</p>
              <span className="text-sm font-body font-semibold text-brand-gold flex items-center justify-center gap-1">Contact Us <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
            <Link href="/contact?type=provider" className="card-public p-8 text-center hover:border-brand-sage/30 transition-all group">
              <div className="w-14 h-14 rounded-sm bg-brand-sage/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-sage/20"><Wrench className="w-7 h-7 text-brand-sage" /></div>
              <h3 className="font-display text-base font-semibold text-brand-forest mb-2">Service Provider</h3>
              <p className="text-sm text-brand-muted font-body mb-4">Apply as a vendor</p>
              <span className="text-sm font-body font-semibold text-brand-gold flex items-center justify-center gap-1">Contact Us <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
          <div className="mt-12 max-w-2xl mx-auto text-center bg-white rounded-sm border border-gray-100 p-8">
            <Users className="w-10 h-10 text-brand-sage mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-brand-forest mb-2">Looking for Work?</h3>
            <p className="text-sm text-brand-muted font-body mb-6">Create a Resident Portal account to set up your household, add family members, browse jobs, and apply.</p>
            <Link href="/auth/login?redirect=/applicant/jobs" className="btn-primary text-xs">Sign In / Create Account</Link>
          </div>
        </div>
      </section>
    </>
  );
}
