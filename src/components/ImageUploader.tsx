import { ChangeEvent, DragEvent, useState, useRef } from 'react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Converte o FileList para um array de Files e filtra apenas imagens
      const filesArray = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      if (filesArray.length > 0) onUpload(filesArray);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (filesArray.length > 0) onUpload(filesArray);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-800/50'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* Adicionado o atributo "multiple" para permitir selecionar várias imagens */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" multiple className="hidden" />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="text-slate-600 dark:text-slate-400 text-lg">
          <span className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500">Clique para selecionar</span> ou arraste as suas imagens até aqui
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">Suporta PNG, JPEG e WebP (Múltiplos ficheiros permitidos)</p>
      </div>
    </div>
  );
}