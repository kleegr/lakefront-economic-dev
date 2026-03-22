'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '../layout';
import { Heart, Trash2, Briefcase } from 'lucide-react';

export default function SavedJobsPage() {
  const { activeMember, members } = useHousehold();
  const [savedJobs, setSavedJobs] = useState<Record<string,unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!activeMember) { setLoading(false); return; }
      const { data } = await supabase.from('lf_saved_jobs').select('*, lf_jobs(*)').eq('member_id', activeMember.id).order('saved_at', { ascending: false });
      setSavedJobs(data || []);
      setLoading(false);
    }
    load();
  }, [activeMember]);

  const removeSaved = async (id: string, jobId: string) => {
    await supabase.from('lf_saved_jobs').delete().eq('id', id);
    setSavedJobs(prev => prev.filter(s => (s.id as string) !== id));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-forest mb-1">Saved Jobs</h1>
      <p className="text-sm font-body text-gray-500 mb-6">{activeMember ? `Saved by: ${activeMember.full_name}` : 'Select a member to see saved jobs'}</p>

      {!activeMember ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm font-body text-blue-800">Add a household member to save jobs.</div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400 font-body">No saved jobs yet. Browse jobs and click the heart to save.</p></div>
      ) : (
        <div className="space-y-3">{savedJobs.map(s => {
          const j = s.lf_jobs as Record<string,unknown>;
          return (
            <div key={s.id as string} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-brand-forest text-sm font-body">{j?.title as string || 'Job'}</div>
                <div className="text-xs text-gray-400">{j?.job_type as string} &middot; {j?.salary_range as string || 'Salary TBD'}</div>
              </div>
              <button onClick={() => removeSaved(s.id as string, s.job_id as string)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}</div>
      )}
    </div>
  );
}
