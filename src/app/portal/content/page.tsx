'use client';
import { useState } from 'react';
import { Save, Globe, FileEdit, Eye, Image, Type, Layout } from 'lucide-react';

const EDITABLE_SECTIONS = [
  { id:'hero', label:'Homepage Hero', fields: [
    { key:'heroTitle', label:'Title', type:'text', value:'Welcome to Lakefront Estates' },
    { key:'heroSubtitle', label:'Subtitle (Gold Text)', type:'text', value:'Economic Development' },
    { key:'heroDescription', label:'Description', type:'textarea', value:'A vibrant community with strong values. Explore jobs, business opportunities, and investment in the growing Lakefront Economy.' },
  ]},
  { id:'about', label:'About Section', fields: [
    { key:'aboutTitle', label:'Title', type:'text', value:'A Complete Economic Ecosystem' },
    { key:'aboutText1', label:'Paragraph 1', type:'textarea', value:'Located on 550 acres in Okeechobee, Florida, Lakefront Estates is building more than homes...' },
    { key:'aboutText2', label:'Paragraph 2', type:'textarea', value:'Less than an hour and a half from Boca, Palm Beach, and Orlando...' },
  ]},
  { id:'cta', label:'Call to Action', fields: [
    { key:'ctaTitle', label:'Title', type:'text', value:'Join the Lakefront Economy' },
    { key:'ctaDescription', label:'Description', type:'textarea', value:'Whether you are a job seeker, entrepreneur, service provider, or investor \u2014 there is a place for you.' },
  ]},
  { id:'contact', label:'Contact Information', fields: [
    { key:'phone', label:'Phone', type:'text', value:'863.333.9400' },
    { key:'email', label:'Email', type:'text', value:'info@lakefrontestatesfl.com' },
    { key:'address', label:'Address', type:'text', value:'Okeechobee, FL 34974' },
  ]},
  { id:'footer', label:'Footer', fields: [
    { key:'tagline', label:'Tagline', type:'text', value:'A Vibrant Community of Values' },
    { key:'ehoText', label:'Equal Housing Statement', type:'textarea', value:'Lakefront is committed to the letter and spirit of the U.S. and Florida Fair Housing Acts.' },
  ]},
];

export default function PortalContentPage() {
  const [activeSection, setActiveSection] = useState('hero');
  const [saving, setSaving] = useState(false);
  const section = EDITABLE_SECTIONS.find(s => s.id === activeSection);

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); alert('Content saved! (Demo mode \u2014 connect Kleegr CRM for live content management)'); }, 500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-brand-text">Content Manager</h1><p className="text-sm font-body text-brand-muted mt-1">Edit website text, images, and page content.</p></div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm font-body font-medium text-brand-text/70 hover:bg-gray-50 transition-colors"><Eye className="w-4 h-4" /> Preview Site</a>
          <button onClick={handleSave} disabled={saving} className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Publish Changes'}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section picker */}
        <div className="lg:col-span-1">
          <div className="card-portal p-2 space-y-1">
            {EDITABLE_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-body font-medium transition-all ${activeSection === s.id ? 'bg-portal-accent text-white' : 'text-brand-text/70 hover:bg-gray-50'}`}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="card-portal p-4 mt-4">
            <h3 className="text-xs font-body font-semibold text-brand-muted uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50 rounded-lg transition-colors"><Image className="w-4 h-4 text-portal-accent" /> Manage Images</button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50 rounded-lg transition-colors"><Layout className="w-4 h-4 text-portal-accent" /> Page Layout</button>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-body text-brand-text/70 hover:bg-gray-50 rounded-lg transition-colors"><Type className="w-4 h-4 text-portal-accent" /> Typography</button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {section && (
            <div className="card-portal p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2"><FileEdit className="w-5 h-5 text-portal-accent" /><h2 className="text-lg font-display font-semibold text-brand-text">{section.label}</h2></div>
                <span className="text-xs font-body text-brand-muted bg-gray-100 px-2 py-1 rounded">Editing</span>
              </div>
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-body font-medium text-brand-muted mb-1.5 uppercase tracking-wider">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea rows={4} defaultValue={field.value} className="input-portal" />
                  ) : (
                    <input type="text" defaultValue={field.value} className="input-portal" />
                  )}
                </div>
              ))}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button onClick={handleSave} disabled={saving} className="btn-portal"><Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Changes'}</button>
                <button className="px-4 py-2.5 text-sm font-body font-medium text-brand-muted hover:text-brand-text transition-colors">Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
