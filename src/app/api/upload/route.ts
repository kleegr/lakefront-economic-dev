import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  const ext = file.name.split('.').pop() || 'pdf';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const { data, error } = await supabase.storage.from('resumes').upload(filename, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filename);
  return NextResponse.json({ url: urlData.publicUrl, path: data.path, filename });
}
