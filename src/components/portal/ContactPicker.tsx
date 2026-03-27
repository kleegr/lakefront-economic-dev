'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Check, Zap } from 'lucide-react';

interface Contact {
  id: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  kleegr_id: string | null;
}

interface ContactPickerProps {
  value: string;
  onChange: (name: string) => void;
  onSelect: (contact: { name: string; email: string; phone: string }) => void;
  placeholder?: string;
  required?: boolean;
}

export default function ContactPicker({ value, onChange, onSelect, placeholder, required }: ContactPickerProps) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<Contact[]>([]);
  const [showDD, setShowDD] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<any>(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowDD(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function searchContacts(q: string) {
    setSearching(true);
    try {
      const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.contacts || []);
    } catch { setResults([]); }
    setSearching(false);
  }

  function handleInput(val: string) {
    setQuery(val);
    onChange(val);
    setSelected(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => searchContacts(val), 300);
    setShowDD(true);
  }

  function handleSelect(c: Contact) {
    setQuery(c.name);
    setSelected(true);
    setShowDD(false);
    onSelect({ name: c.name, email: c.email, phone: c.phone });
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => { searchContacts(query); setShowDD(true); }}
          className="input-portal pl-10"
          placeholder={placeholder || 'Search Kleegr contacts or type new...'}
          required={required}
        />
        {selected && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
      </div>

      {showDD && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
          {searching && <div className="p-3 text-xs text-gray-400 font-body text-center">Searching portal + Kleegr...</div>}
          {!searching && results.length === 0 && <div className="p-3 text-xs text-gray-400 font-body text-center">No contacts found. Type a new name.</div>}
          {results.map(c => (
            <button
              key={c.id + c.source}
              type="button"
              onClick={() => handleSelect(c)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-body font-semibold text-brand-forest">
                    <User className="w-3 h-3 inline mr-1" />{c.name || c.email}
                  </p>
                  <p className="text-[10px] font-body text-gray-400">
                    {c.email}{c.phone ? ` \u00b7 ${c.phone}` : ''}{c.company ? ` \u00b7 ${c.company}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {c.kleegr_id && <span className="px-1.5 py-0.5 text-[8px] rounded bg-green-50 text-green-600 font-semibold flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Kleegr</span>}
                  <span className={`px-1.5 py-0.5 text-[8px] rounded font-semibold ${c.source === 'kleegr' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {c.source === 'kleegr' ? 'Kleegr' : 'Portal'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
