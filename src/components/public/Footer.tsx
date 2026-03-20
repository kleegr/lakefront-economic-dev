import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="bg-brand-dark">
      <div className="max-container section-padding py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          <div>
            <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/06/Lakefront-Estates-logo-light-large-no-bg-scaled.png" alt="Lakefront Estates" className="h-14 w-auto mb-5" />
            <p className="text-sm text-white/40 font-body italic">A Vibrant Community of Values</p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-5 text-brand-gold uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[{label:'About',href:'/about'},{label:'Jobs Board',href:'/jobs'},{label:'Business Directory',href:'/businesses'},{label:'Commercial Spaces',href:'/commercial'},{label:'Investors',href:'/investors'},{label:'Service Providers',href:'/services'}].map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm text-white/40 hover:text-brand-gold transition-colors font-body">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-5 text-brand-gold uppercase tracking-wider">Questions? Comments?</h4>
            <ul className="space-y-2.5">
              <li><a href="tel:+18633339400" className="text-sm text-white/40 hover:text-brand-gold transition-colors font-body">863.333.9400</a></li>
              <li><a href="mailto:info@lakefrontestatesfl.com" className="text-sm text-white/40 hover:text-brand-gold transition-colors font-body">info@lakefrontestatesfl.com</a></li>
              <li><Link href="/contact" className="text-sm text-white/40 hover:text-brand-gold transition-colors font-body">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-container section-padding py-6">
          <p className="text-[11px] text-white/20 font-body text-center mb-6">ALL IMAGES ARE FOR ILLUSTRATION PURPOSES ONLY</p>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
            <img src="https://lakefrontestatesfl.com/wp-content/uploads/2025/02/Equal-Housing-Opportunity-icon-white-no-bg.png" alt="Equal Housing" className="h-10 w-auto opacity-30" />
            <div><h5 className="text-xs font-display font-semibold text-white/40 mb-1">Equal Housing Opportunity Statement</h5><p className="text-[11px] text-white/25 font-body leading-relaxed">Lakefront is committed to the letter and spirit of the U.S. and Florida Fair Housing Acts. We do not discriminate based on race, color, religion, sex, disability, familial status, or national origin. This community is open to all qualified individuals without regard to background.</p></div>
          </div>
          <p className="text-[11px] text-white/20 font-body text-center mt-6">&copy; 2023 &ndash; {new Date().getFullYear()} Lakefront Estates</p>
        </div>
      </div>
    </footer>
  );
}
