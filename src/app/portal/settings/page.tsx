export default function SettingsPortalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-text">Settings</h1>
        <p className="text-sm font-body text-brand-muted mt-1">Portal configuration and integrations.</p>
      </div>
      <div className="card-portal p-6 space-y-4">
        <h2 className="text-base font-display font-semibold text-brand-text">GoHighLevel Integration</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">API Key Status</label>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span><span className="text-sm font-body text-brand-muted">Not configured</span></div>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Location ID</label>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span><span className="text-sm font-body text-brand-muted">Not configured</span></div>
          </div>
        </div>
        <p className="text-xs font-body text-gray-400">Set GHL_API_KEY and GHL_LOCATION_ID in environment variables to connect.</p>
      </div>
      <div className="card-portal p-6 space-y-4">
        <h2 className="text-base font-display font-semibold text-brand-text">Authentication</h2>
        <p className="text-xs font-body text-gray-400">Configure your auth provider (Auth.js, Clerk, or Supabase Auth) to enable secure portal access.</p>
      </div>
    </div>
  );
}
