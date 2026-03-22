'use client';
import { useHousehold } from '../layout';

export default function ApplicantSettingsPage() {
  const { approved } = useHousehold();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Settings</h1>
      <p className="text-sm font-body text-gray-500 mb-6">Account settings and preferences</p>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-body font-semibold">Account Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{approved ? 'Approved' : 'Pending Approval'}</span>
        </div>
        <p className="text-xs font-body text-gray-400">Contact your administrator if you need to change your account settings.</p>
      </div>
    </div>
  );
}
