import { Plus } from 'lucide-react';
export default function ContentPortalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-text">Content Management</h1>
          <p className="text-sm font-body text-brand-muted mt-1">Manage public website content blocks.</p>
        </div>
        <button className="btn-portal"><Plus className="w-4 h-4 mr-1.5" /> New Block</button>
      </div>
      <div className="card-portal p-12 text-center"><p className="text-sm font-body text-brand-muted">Content management module ready.</p></div>
    </div>
  );
}
