import { useMemo, useState, useEffect } from 'react';
import { ProcessedImageResult } from '@/lib/imageProcessor';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface DownloadSectionProps { 
  results: ProcessedImageResult[]; 
  isProcessing: boolean;
  originalFiles: File[];
}

export default function DownloadSection({ results, isProcessing, originalFiles }: DownloadSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'final' | 'original'>('final');

  useEffect(() => {
    setCurrentIndex(0);
    setViewMode('final');
  }, [results.length]);

  const activeOriginalUrl = useMemo(() => {
    const file = originalFiles[currentIndex];
    return file ? URL.createObjectURL(file) : '';
  }, [originalFiles, currentIndex]);

  const activeResult = results[currentIndex];

  const totalSize = useMemo(() => {
    const bytes = results.reduce((acc, res) => acc + res.sizeBytes, 0);
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  }, [results]);

  const activeExtension = useMemo(() => activeResult?.blob.type === 'image/png' ? 'png' : activeResult?.blob.type === 'image/webp' ? 'webp' : 'jpg', [activeResult?.blob.type]);

  const handleDownloadSingle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const link = document.createElement('a');
        link.href = reader.result as string;
        link.download = `imagem_processada_${currentIndex + 1}.${activeExtension}`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
      };
      reader.readAsDataURL(activeResult.blob);
    } catch {
      const link = document.createElement('a');
      link.href = activeResult.url;
      link.download = `imagem_processada_${currentIndex + 1}.${activeExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadZip = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      results.forEach((res, index) => {
        const ext = res.blob.type === 'image/png' ? 'png' : res.blob.type === 'image/webp' ? 'webp' : 'jpg';
        zip.file(`imagem_${index + 1}.${ext}`, res.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagens_processadas.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: results[0].width > results[0].height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [results[0].width, results[0].height]
      });

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (i > 0) doc.addPage([res.width, res.height], res.width > res.height ? 'landscape' : 'portrait');
        
        const reader = new FileReader();
        const base64data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(res.blob);
        });

        let pdfFormat = 'JPEG';
        if (res.blob.type === 'image/png') pdfFormat = 'PNG';
        else if (res.blob.type === 'image/webp') pdfFormat = 'WEBP';

        doc.addImage(base64data, pdfFormat, 0, 0, res.width, res.height);
      }
      doc.save(results.length > 1 ? 'imagens_processadas.pdf' : 'imagem_processada.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!activeResult) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
      {(isProcessing || isGenerating) && (
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-blue-900 dark:text-blue-400">
              {isGenerating ? 'A empacotar ficheiros...' : 'A aplicar alterações...'}
            </span>
          </div>
        </div>
      )}
      
      {/* CABEÇALHO ATUALIZADO: Título e Botões de Alternância no mesmo nível */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 text-left">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Imagens Finais</h3>
          {results.length > 1 && (
            <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {currentIndex + 1} de {results.length}
            </span>
          )}
        </div>

        {/* Controlo de Alternância movido para fora da imagem */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setViewMode('original')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'original' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setViewMode('final')}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'final' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Final
          </button>
        </div>
      </div>

      <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-4 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={viewMode === 'original' ? activeOriginalUrl : activeResult.url} 
          alt={viewMode === 'original' ? 'Original' : 'Final'} 
          className="max-h-full w-auto object-contain transition-opacity duration-300" 
        />
      </div>

      {results.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 custom-scrollbar">
          {results.map((res, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setViewMode('final');
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === idx ? 'border-blue-600 dark:border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={res.url} alt={`Thumb Final ${idx}`} className="w-full h-full object-cover bg-slate-200 dark:bg-slate-800" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6 text-left">
        <div><span className="font-semibold text-slate-900 dark:text-slate-200 block">Formato Atual</span>{activeResult.blob.type.replace('image/', '').toUpperCase()}</div>
        <div><span className="font-semibold text-slate-900 dark:text-slate-200 block">Tamanho Final Total</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{totalSize}</span></div>
        <div className="col-span-2"><span className="font-semibold text-slate-900 dark:text-slate-200 block">Nova Resolução</span>{activeResult.width}px × {activeResult.height}px</div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={results.length > 1 ? handleDownloadZip : handleDownloadSingle} className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {results.length > 1 ? `Baixar ZIP (${results.length})` : 'Baixar Imagem'}
        </button>
        <button onClick={handleDownloadPDF} className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Baixar PDF
        </button>
      </div>
    </div>
  );
}