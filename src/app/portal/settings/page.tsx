'use client';
import { Save, Globe, Key, Bell, Database, Shield } from 'lucide-react';

export default function PortalSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-display font-bold text-brand-text">Settings</h1><p className="text-sm font-body text-brand-muted mt-1">Configure your Lakefront Economy portal.</p></div>

      <div className="card-portal p-6 space-y-5">
        <div className="flex items-center gap-3"><Database className="w-5 h-5 text-portal-accent" /><h2 className="text-base font-display font-semibold text-brand-text">Kleegr Integration</h2></div>
        <p className="text-sm font-body text-brand-muted">Connect to your Kleegr CRM to sync contacts, companies, opportunities, and pipeline data.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Kleegr API Key</label><input type="password" className="input-portal" placeholder="Enter your Kleegr API key" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Location ID</label><input type="text" className="input-portal" placeholder="Enter Kleegr location ID" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Webhook Secret</label><input type="password" className="input-portal" placeholder="Webhook signing secret" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Webhook URL</label><div className="input-portal bg-gray-50 text-xs text-brand-muted truncate">/api/kleegr/webhook</div></div>
        </div>
        <button className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> Save Kleegr Settings</button>
      </div>

      <div className="card-portal p-6 space-y-5">
        <div className="flex items-center gap-3"><Key className="w-5 h-5 text-portal-accent" /><h2 className="text-base font-display font-semibold text-brand-text">Pipeline Configuration</h2></div>
        <p className="text-sm font-body text-brand-muted">Map your Kleegr pipelines to Lakefront Economy modules.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">ATS Pipeline ID</label><input type="text" className="input-portal" placeholder="Job applications pipeline" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Business Intake Pipeline ID</label><input type="text" className="input-portal" placeholder="Business applications pipeline" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Investor Pipeline ID</label><input type="text" className="input-portal" placeholder="Investor leads pipeline" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Provider Pipeline ID</label><input type="text" className="input-portal" placeholder="Service provider pipeline" /></div>
        </div>
        <button className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> Save Pipeline Config</button>
      </div>

      <div className="card-portal p-6 space-y-5">
        <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-portal-accent" /><h2 className="text-base font-display font-semibold text-brand-text">Site Settings</h2></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Site Name</label><input type="text" className="input-portal" defaultValue="Lakefront Economy" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Contact Email</label><input type="email" className="input-portal" defaultValue="info@lakefrontestatesfl.com" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Phone</label><input type="tel" className="input-portal" defaultValue="863.333.9400" /></div>
          <div><label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">Address</label><input type="text" className="input-portal" defaultValue="Okeechobee, FL 34974" /></div>
        </div>
        <button className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> Save Site Settings</button>
      </div>

      <div className="card-portal p-6 space-y-5">
        <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-portal-accent" /><h2 className="text-base font-display font-semibold text-brand-text">Notifications</h2></div>
        <div className="space-y-3">
          {['New job application received','New business inquiry','New investor lead','New service provider application','Weekly summary report'].map(item => (
            <div key={item} className="flex items-center justify-between py-2">
              <span className="text-sm font-body text-brand-text/70">{item}</span>
              <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" defaultChecked className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-portal-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-portal-accent after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" /></label>
            </div>
          ))}
        </div>
        <button className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> Save Notifications</button>
      </div>
    </div>
  );
}
