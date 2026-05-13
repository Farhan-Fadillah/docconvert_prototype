import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // F-001: Auto-Deteksi Format File berdasarkan MIME Type
    const mimeType = file.type;
    let targetFormat = '';
    
    if (mimeType === 'application/pdf') {
      targetFormat = 'DOCX';
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      mimeType === 'application/msword'
    ) {
      targetFormat = 'PDF';
    } else {
      return NextResponse.json({ 
        error: 'Format tidak didukung. Harap unggah PDF atau Word.' 
      }, { status: 400 });
    }

    // Simulasi pembuatan Job ID di memori (Tanpa DB)
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      message: 'Upload berhasil, konversi dimulai.',
      job_id: jobId,
      source_format: mimeType.includes('pdf') ? 'PDF' : 'DOCX',
      target_format: targetFormat,
      filename: file.name,
      // Simulasi total chunks untuk file besar (F-004)
      total_chunks: Math.floor(Math.random() * 50) + 10 
    }, { status: 202 });

  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}