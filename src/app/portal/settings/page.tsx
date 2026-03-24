'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Users, Tag, Key, Plug, Eye, ScrollText, Settings, ChevronRight, Sliders } from 'lucide-react';

// ITEM 15: Settings is now a full page with cards for each sub-section
// ITEM 14: Job Fields Configuration is here
// ITEM 16/17: Renamed GHL to Kleegr Integration
const SETTINGS_SECTIONS = [
  { label: 'Users & Access', description: 'Manage admin users, roles, and permissions', href: '/portal/users', icon: Users },
  { label: 'Job Fields Configuration', description: 'Add/edit fields, dropdown options, GHL sync mapping', href: '/portal/settings/job-fields', icon: Sliders },
  { label: 'Kleegr Integration', description: 'Configure API keys, verify connection, manage sync', href: '/portal/ghl-setup', icon: Plug },
  { label: 'Skills', description: 'Manage skill tags for job matching', href: '/portal/skills', icon: Tag },
  { label: 'AI Settings', description: 'Anthropic API key, resume builder config', href: '/portal/ai-settings', icon: Key },
  { label: 'Impersonate', description: 'View portal as another user', href: '/portal/impersonate', icon: Eye },
  { label: 'Audit Log', description: 'Track all admin actions and changes', href: '/portal/audit', icon: ScrollText },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-forest">Settings</h1>
        <p className="text-sm font-body text-gray-400 mt-1">Configure your portal, integrations, and team</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-brand-sage/30 transition-all group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-sage/10 flex items-center justify-center shrink-0 group-hover:bg-brand-sage/20 transition-colors">
                <s.icon className="w-5 h-5 text-brand-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-semibold text-brand-forest group-hover:text-brand-sage transition-colors">{s.label}</h3>
                <p className="text-xs font-body text-gray-400 mt-1">{s.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand-sage transition-colors shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
