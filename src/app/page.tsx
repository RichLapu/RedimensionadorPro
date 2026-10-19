'use client';

import { useRef, ChangeEvent } from 'react';
import { useImageState } from '@/hooks/useImageState';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from '@/components/ImagePreview';
import ControlPanel from '@/components/ControlPanel';
import DownloadSection from '@/components/DownloadSection';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const state = useImageState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMore = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      state.addFiles(newFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Extrai apenas o objeto File do nosso novo estado para manter compatibilidade com a secção de Download
  const filesList = state.items.map(item => item.file);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-200 dark:selection:bg-blue-900 flex flex-col font-sans transition-colors duration-300">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-950 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:6rem_4rem] transition-colors duration-300">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,#312e81,transparent)]"></div>
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <ThemeToggle />
      </div>

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl mb-2 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
               <svg className="w-8 h-8 text-blue-600 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl transition-colors">
              Redimensionador <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Pro</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium transition-colors">
              Otimize as suas imagens diretamente no navegador. Rápido, seguro e privado.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 ring-1 ring-slate-200/60 dark:ring-slate-800 overflow-hidden transition-all duration-300">
            <div className="p-6 sm:p-10">
              {state.items.length === 0 ? (
                <div className="max-w-2xl mx-auto py-8">
                  <ImageUploader onUpload={state.addFiles} />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800 transition-colors gap-4">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                      Painel de Edição
                      <span className="text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 py-1 px-3 rounded-full">
                        {state.items.length} {state.items.length === 1 ? 'imagem' : 'imagens'}
                      </span>
                    </h2>
                    
                    <div className="flex w-full sm:w-auto gap-2">
                      <input type="file" ref={fileInputRef} onChange={handleAddMore} accept="image/png, image/jpeg, image/webp" multiple className="hidden" />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-4 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Adicionar Mais
                      </button>
                      
                      <button
                        onClick={state.clearItems}
                        className="flex-none flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-4 py-2.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-700 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
                        title="Limpar todas as imagens"
                      >
                        <svg className="w-4 h-4 hover:-rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        <span className="hidden sm:inline">Limpar</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-8">
                      {/* Componente atualizado recebendo o estado completo e as novas funções */}
                      <ImagePreview 
                        items={state.items}
                        setItems={state.setItems}
                        dimensions={state.originalDimensions} 
                        onRemove={state.removeItem}
                        onCrop={state.updateCrop}
                      />
                      
                      {state.results.length > 0 && (
                        <DownloadSection 
                          results={state.results} 
                          isProcessing={state.isProcessing} 
                          originalFiles={filesList} 
                        />
                      )}
                    </div>
                    <div className="lg:col-span-5">
                      <div className="sticky top-8">
                        <ControlPanel 
                          options={state.options} 
                          onChange={state.setOptions} 
                          originalDimensions={state.originalDimensions} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center transition-colors">
            © 2026 Redimensionador de Imagens. Todos os direitos reservados.
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 flex-wrap transition-colors">
            Desenvolvido por 
            <a
              href="https://www.linkedin.com/in/richard-lapuente/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-all flex items-center gap-1"
            >
              Richard Lapuente
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}