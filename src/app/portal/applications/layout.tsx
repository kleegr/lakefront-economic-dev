'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Building2, Wrench, Warehouse, FileText } from 'lucide-react';

// Separate tabs/pages for each application type
const APP_TABS = [
  { key: 'all', label: 'All', href: '/portal/applications', icon: FileText },
  { key: 'employee', label: 'Employees', href: '/portal/applications/employees', icon: Users },
  { key: 'employer', label: 'Employers', href: '/portal/applications/employers', icon: Building2 },
  { key: 'provider', label: 'Providers', href: '/portal/applications/providers', icon: Wrench },
  { key: 'space', label: 'Spaces', href: '/portal/applications/spaces', icon: Warehouse },
];

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white rounded-xl border p-1.5 overflow-x-auto">
        {APP_TABS.map(t => {
          const isActive = pathname === t.href || (t.key !== 'all' && pathname.startsWith(t.href));
          return (
            <Link key={t.key} href={t.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body font-semibold transition-colors whitespace-nowrap ${isActive ? 'bg-brand-forest text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
