import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-container section-padding py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <img
              src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png"
              alt="Lakefront Estates & Villas"
              className="h-16 w-auto mb-5"
            />
            <p className="text-sm text-white/50 font-body leading-relaxed italic">A Vibrant Community of Values</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-semibold mb-5 text-brand-gold">Quick Links</h4>
            <ul className="space-y-3">
              {[{label:'About',href:'/about'},{label:'Jobs Board',href:'/jobs'},{label:'Business Directory',href:'/businesses'},{label:'Commercial Spaces',href:'/commercial'},{label:'Investor Opportunities',href:'/investors'},{label:'Service Providers',href:'/services'}].map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm text-white/50 hover:text-brand-gold transition-colors duration-300 font-body">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold mb-5 text-brand-gold">Questions? Comments?</h4>
            <ul className="space-y-3">
              <li><a href="tel:+18633339400" className="flex items-center gap-3 text-sm text-white/50 hover:text-brand-gold transition-colors duration-300 font-body"><Phone className="w-4 h-4 shrink-0" />863.333.9400</a></li>
              <li><a href="mailto:info@lakefrontestatesfl.com" className="flex items-center gap-3 text-sm text-white/50 hover:text-brand-gold transition-colors duration-300 font-body"><Mail className="w-4 h-4 shrink-0" />info@lakefrontestatesfl.com</a></li>
              <li><Link href="/contact" className="flex items-center gap-3 text-sm text-white/50 hover:text-brand-gold transition-colors duration-300 font-body">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Equal Housing */}
      <div className="border-t border-white/10">
        <div className="max-container section-padding py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="w-12 h-12 border-2 border-white/20 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0 leading-tight text-center">EQUAL<br/>HOUSING</div>
            <div>
              <h5 className="text-xs font-display font-semibold text-white/60 mb-1">Equal Housing Opportunity Statement</h5>
              <p className="text-xs text-white/30 font-body leading-relaxed">Lakefront is committed to the letter and spirit of the U.S. and Florida Fair Housing Acts. We do not discriminate based on race, color, religion, sex, disability, familial status, or national origin. This community is open to all qualified individuals without regard to background.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
            <p className="text-[11px] text-white/25 font-body">ALL IMAGES ARE FOR ILLUSTRATION PURPOSES ONLY</p>
            <p className="text-[11px] text-white/25 font-body">&copy; 2023 &ndash; {new Date().getFullYear()} Lakefront Estates</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
