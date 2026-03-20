import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-container section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="mb-4"><span className="font-display text-2xl font-bold text-white">Lakefront</span><p className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold mt-0.5">Economic Development</p></div>
            <p className="text-sm text-white/60 font-body leading-relaxed">A vibrant community of values in Okeechobee, Florida.</p>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-brand-gold">Quick Links</h4>
            <ul className="space-y-2.5">
              {[{label:'About',href:'/about'},{label:'Jobs Board',href:'/jobs'},{label:'Business Directory',href:'/businesses'},{label:'Commercial Spaces',href:'/commercial'},{label:'Investor Opportunities',href:'/investors'},{label:'Service Providers',href:'/services'}].map(link => (<li key={link.href}><Link href={link.href} className="text-sm text-white/60 hover:text-brand-gold transition-colors font-body">{link.label}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-brand-gold">Contact</h4>
            <ul className="space-y-3">
              <li><a href="tel:+18633339400" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-brand-gold transition-colors font-body"><Phone className="w-4 h-4 shrink-0" />863.333.9400</a></li>
              <li><a href="mailto:info@lakefrontestatesfl.com" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-brand-gold transition-colors font-body"><Mail className="w-4 h-4 shrink-0" />info@lakefrontestatesfl.com</a></li>
              <li><div className="flex items-start gap-2.5 text-sm text-white/60 font-body"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />Okeechobee, FL 34974</div></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-base font-semibold mb-4 text-brand-gold">Get Involved</h4>
            <p className="text-sm text-white/60 font-body mb-4">Explore career, business, and investment opportunities.</p>
            <Link href="/apply" className="btn-primary text-xs">Apply Today</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-container section-padding py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-white text-xs font-bold shrink-0">EHO</div>
            <p className="text-xs text-white/40 font-body leading-relaxed">Lakefront is committed to the U.S. and Florida Fair Housing Acts. We do not discriminate based on race, color, religion, sex, disability, familial status, or national origin.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
            <p className="text-xs text-white/30 font-body">&copy; 2023&ndash;{new Date().getFullYear()} Lakefront Estates.</p>
            <div className="flex items-center gap-4"><Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 font-body transition-colors">Privacy</Link><Link href="/terms" className="text-xs text-white/30 hover:text-white/60 font-body transition-colors">Terms</Link></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
