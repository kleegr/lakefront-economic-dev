'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/household-context';
import { FileText, Sparkles, Download, RefreshCw, Save, MessageSquare } from 'lucide-react';

export default function ResumeBuilderPage() {
  const { activeMember, members } = useHousehold();
  const [step, setStep] = useState<'start'|'questions'|'generating'|'result'>('start');
  const [existingResume, setExistingResume] = useState('');
  const [questions, setQuestions] = useState('');
  const [answers, setAnswers] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const callAI = async (action: string, extra?: Record<string,unknown>) => {
    if (!activeMember) return '';
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`https://cizfkddevtqpudgksxhc.supabase.co/functions/v1/ai-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ memberName: activeMember.full_name, action, existingResume, ...extra }),
    });
    const data = await res.json();
    return data.result || data.error || '';
  };

  const getQuestions = async () => {
    setLoading(true); setStep('questions');
    const result = await callAI('questions');
    setQuestions(result); setLoading(false);
  };

  const generateResume = async () => {
    setLoading(true); setStep('generating');
    const result = await callAI('generate', { answers });
    setResume(result); setStep('result'); setLoading(false);
  };

  const regenerate = async () => {
    setLoading(true);
    const result = await callAI('generate', { answers });
    setResume(result); setLoading(false);
  };

  const downloadTxt = () => {
    const blob = new Blob([resume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeMember?.full_name || 'resume'}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  const saveToProfile = async () => {
    if (!activeMember) return;
    await supabase.from('lf_household_members').update({ additional_notes: `AI Resume:\n${resume}` }).eq('id', activeMember.id);
    setSaved(true); setTimeout(()=>setSaved(false), 3000);
  };

  if (!activeMember) return (
    <div className="text-center py-20"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-sm text-gray-400 font-body">Select a household member to build a resume.</p></div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-brand-forest">AI Resume Builder</h1><p className="text-sm font-body text-gray-500">Building for: {activeMember.full_name}</p></div>
        <Sparkles className="w-6 h-6 text-brand-gold" />
      </div>

      {step === 'start' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-display font-semibold text-brand-forest mb-3">Have an existing resume?</h3>
            <p className="text-sm font-body text-gray-500 mb-3">Paste your current resume text below and our AI will help improve it. Or leave blank to start fresh.</p>
            <textarea value={existingResume} onChange={e=>setExistingResume(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Paste existing resume text here (optional)..." />
          </div>
          <div className="flex gap-3">
            <button onClick={getQuestions} className="flex-1 py-3 bg-brand-forest text-white rounded-xl text-sm font-body font-semibold flex items-center justify-center gap-2 hover:bg-brand-forest/90"><MessageSquare className="w-4 h-4" />Start with Questions</button>
            <button onClick={generateResume} className="flex-1 py-3 bg-brand-gold text-white rounded-xl text-sm font-body font-semibold flex items-center justify-center gap-2 hover:bg-brand-gold/90"><Sparkles className="w-4 h-4" />Generate Directly</button>
          </div>
        </div>
      )}

      {step === 'questions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-display font-semibold text-brand-forest mb-3">Follow-up Questions</h3>
            {loading ? <div className="flex items-center gap-2 text-sm text-gray-400"><div className="animate-spin h-4 w-4 border-2 border-brand-sage border-t-transparent rounded-full" />Thinking...</div> : <div className="text-sm font-body text-gray-700 whitespace-pre-line bg-brand-sage/5 rounded-lg p-4">{questions}</div>}
          </div>
          {!loading && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-display font-semibold text-brand-forest mb-3">Your Answers</h3>
              <textarea value={answers} onChange={e=>setAnswers(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body" placeholder="Answer the questions above..." />
              <button onClick={generateResume} disabled={!answers} className="mt-3 px-6 py-2.5 bg-brand-forest text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50 flex items-center gap-2"><Sparkles className="w-4 h-4" />Generate Resume</button>
            </div>
          )}
        </div>
      )}

      {step === 'generating' && (
        <div className="bg-white rounded-xl border p-12 text-center"><div className="animate-spin h-8 w-8 border-4 border-brand-sage border-t-transparent rounded-full mx-auto mb-4" /><p className="text-sm font-body text-gray-500">Generating your professional resume...</p></div>
      )}

      {step === 'result' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-brand-forest">Your Resume</h3>
              <div className="flex gap-2">
                <button onClick={regenerate} disabled={loading} className="px-3 py-1.5 bg-gray-100 rounded text-xs font-body font-semibold flex items-center gap-1 disabled:opacity-50"><RefreshCw className={`w-3 h-3 ${loading?'animate-spin':''}`} />Regenerate</button>
                <button onClick={downloadTxt} className="px-3 py-1.5 bg-brand-forest text-white rounded text-xs font-body font-semibold flex items-center gap-1"><Download className="w-3 h-3" />Download</button>
                <button onClick={saveToProfile} className="px-3 py-1.5 bg-brand-gold text-white rounded text-xs font-body font-semibold flex items-center gap-1"><Save className="w-3 h-3" />{saved?'Saved!':'Save to Profile'}</button>
              </div>
            </div>
            <textarea value={resume} onChange={e=>setResume(e.target.value)} rows={20} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-body leading-relaxed" />
          </div>
          <button onClick={()=>{setStep('start'); setResume(''); setQuestions(''); setAnswers('');}} className="text-sm font-body text-brand-sage hover:text-brand-forest">&larr; Start over</button>
        </div>
      )}
    </div>
  );
}
