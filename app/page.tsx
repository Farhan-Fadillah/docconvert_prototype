'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, FileUp, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';

export default function DocConvertPro() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'detecting' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [jobId, setJobId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // F-001: Deteksi Format di sisi Frontend (Sebelum Upload)
  const handleFileSelection = (selectedFile: File) => {
    setErrorMessage('');
    setStatus('detecting');
    
    setTimeout(() => {
      const mime = selectedFile.type;
      if (mime === 'application/pdf') {
        setTargetFormat('DOCX');
        setFile(selectedFile);
        setStatus('idle');
      } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime === 'application/msword') {
        setTargetFormat('PDF');
        setFile(selectedFile);
        setStatus('idle');
      } else {
        setFile(null);
        setStatus('error');
        setErrorMessage('Format tidak didukung. Harap unggah file PDF atau Word (.docx).');
      }
    }, 800); // Simulasi delay deteksi
  };

  const startConversion = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload File
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      setJobId(uploadData.job_id);
      setStatus('processing');
      
      // 2. Polling Status (Simulasi WebSockets/Chunk Processing)
      pollStatus(uploadData.job_id, 0);

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah file.');
    }
  };

  const pollStatus = (currentJobId: string, currentProg: number) => {
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/status?job_id=${currentJobId}&current_progress=${currentProg}`);
        const data = await res.json();

        setProgress(data.progress);

        if (data.status === 'completed') {
          setStatus('completed');
        } else if (data.status === 'processing') {
          pollStatus(currentJobId, data.progress); // Recursive poll every 1.5s
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Koneksi terputus saat memantau konversi.');
      }
    }, 1500);
  };

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setJobId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-800">
      {/* Header */}
      <div className="max-w-3xl w-full mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">DocConvert Pro</h1>
        <p className="text-slate-500">Konversi Dokumen Skala Enterprise dengan Fidelitas Tinggi</p>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8">
          
          {/* State: Idle / File Selected */}
          {(status === 'idle' || status === 'detecting' || status === 'error') && (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors
                ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}
                ${status === 'error' ? 'border-red-400 bg-red-50' : ''}
              `}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.doc" />
              
              {status === 'detecting' ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-600">Mendeteksi format file (MIME type)...</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-emerald-500 mb-4" />
                  <p className="text-lg font-medium text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-medium mb-6">
                    Mendeteksi: File <span className="text-blue-600 font-bold">{targetFormat === 'DOCX' ? 'PDF' : 'Word'}</span>. Akan dikonversi ke <span className="text-blue-600 font-bold">{targetFormat}</span>.
                  </div>
                  <div className="flex gap-4">
                    <button onClick={resetState} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">Batal</button>
                    <button onClick={startConversion} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition flex items-center gap-2">
                      <FileUp className="w-4 h-4" /> Mulai Konversi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-1">Drag & drop file Anda di sini</p>
                  <p className="text-sm text-slate-500 mb-6">Mendukung PDF, DOCX hingga 10GB</p>
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition">
                    Pilih File dari Komputer
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" /> {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* State: Processing / Uploading */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="py-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{file?.name}</h3>
                  <p className="text-sm text-slate-500">
                    {status === 'uploading' ? 'Mengunggah file...' : 'Memproses chunk konversi secara paralel...'}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 text-right">Job ID: {jobId}</p>
            </div>
          )}

          {/* State: Completed */}
          {status === 'completed' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Konversi Berhasil!</h3>
              <p className="text-slate-500 mb-8">File Anda telah berhasil dikonversi dan siap diunduh.</p>
              
              <div className="flex justify-center gap-4">
                <button onClick={resetState} className="px-6 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition">
                  Konversi File Lain
                </button>
                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Hasil ({targetFormat})
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-6">*File akan dihapus secara otomatis dalam 24 jam</p>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer / Info */}
      <p className="mt-8 text-sm text-slate-400">
        Vercel Prototype Edition • Infrastruktur Asli Menggunakan Kubernetes & LibreOffice Headless
      </p>
    </div>
  );
}