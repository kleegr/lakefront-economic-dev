import { Plus, Search } from 'lucide-react';
export default function InvestorsPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-text">Investor Leads</h1>
          <p className="text-sm font-body text-brand-muted mt-1">Track investor inquiries and pipeline.</p>
        </div>
        <button className="btn-portal"><Plus className="w-4 h-4 mr-1.5" /> Add Lead</button>
      </div>
      <div className="card-portal p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search investors..." className="input-portal pl-10" /></div></div>
      <div className="card-portal p-12 text-center"><p className="text-sm font-body text-brand-muted">Module ready. Connect GHL API credentials to populate live data.</p></div>
    </div>
  );
}
