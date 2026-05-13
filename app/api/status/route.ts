import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');
  const currentProgress = parseInt(searchParams.get('current_progress') || '0');

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID tidak valid' }, { status: 400 });
  }

  // Simulasi progress berjalan maju secara acak
  let newProgress = currentProgress + Math.floor(Math.random() * 20) + 10;
  let status = 'processing';

  if (newProgress >= 100) {
    newProgress = 100;
    status = 'completed';
  }

  return NextResponse.json({
    job_id: jobId,
    status: status,
    progress: newProgress,
    // Simulasi link download dummy jika selesai
    download_url: status === 'completed' ? '#dummy-download-link' : null
  });
}