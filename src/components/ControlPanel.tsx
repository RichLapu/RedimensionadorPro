'use client';

import { ChangeEvent, useState, useEffect } from 'react';
import { ImageOptions } from '@/hooks/useImageState';

interface ControlPanelProps {
  options: ImageOptions;
  onChange: (options: ImageOptions | ((prev: ImageOptions) => ImageOptions)) => void;
  originalDimensions: { width: number; height: number };
}

const PRESETS = [
  { label: 'Full HD', width: 1920, height: 1080 },
  { label: 'HD', width: 1280, height: 720 },
  { label: 'Insta Feed', width: 1080, height: 1080 },
  { label: 'Insta Stories', width: 1080, height: 1920 },
  { label: 'Twitter/X Capa', width: 1500, height: 500 },
];

export default function ControlPanel({ options, onChange, originalDimensions }: ControlPanelProps) {
  const [localWidth, setLocalWidth] = useState(options.width.toString());
  const [localHeight, setLocalHeight] = useState(options.height.toString());

  useEffect(() => {
    setLocalWidth(options.width.toString());
    setLocalHeight(options.height.toString());
  }, [options.width, options.height]);

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalWidth(val);
    const newWidth = parseInt(val, 10);
    if (!isNaN(newWidth) && newWidth > 0) {
      onChange((prev) => {
        let newHeight = prev.height;
        if (prev.keepAspectRatio && originalDimensions.width > 0) {
          newHeight = Math.round(newWidth * (originalDimensions.height / originalDimensions.width));
        }
        return { ...prev, width: newWidth, height: newHeight };
      });
    }
  };

  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalHeight(val);
    const newHeight = parseInt(val, 10);
    if (!isNaN(newHeight) && newHeight > 0) {
      onChange((prev) => {
        let newWidth = prev.width;
        if (prev.keepAspectRatio && originalDimensions.height > 0) {
          newWidth = Math.round(newHeight * (originalDimensions.width / originalDimensions.height));
        }
        return { ...prev, width: newWidth, height: newHeight };
      });
    }
  };

  const handlePresetClick = (width: number, height: number) => {
    onChange((prev) => ({ ...prev, width, height, keepAspectRatio: false }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 text-left">Painel de Controlo</h3>
      
      <div className="space-y-3 text-left">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Tamanhos Prontos</label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.label} onClick={() => handlePresetClick(preset.width, preset.height)} className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="block">{preset.label}</span>
              <span className="block text-slate-500 dark:text-slate-400 font-medium">{preset.width}x{preset.height}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 text-left">Largura (px)</label>
            <input type="number" value={localWidth} onChange={handleWidthChange} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 text-left">Altura (px)</label>
            <input type="number" value={localHeight} onChange={handleHeightChange} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors" />
          </div>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={() => onChange((prev) => ({ ...prev, keepAspectRatio: !prev.keepAspectRatio }))} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none">
            <div className={`w-5 h-5 mr-2 border rounded flex items-center justify-center transition-colors ${options.keepAspectRatio ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
              {options.keepAspectRatio && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
            Manter proporção original
          </button>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      {/* SECÇÃO MARCA D'ÁGUA ATUALIZADA (Com barra de Tamanho) */}
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Marca d'Água (Opcional)</label>
          <input 
            type="text" 
            placeholder="Ex: © 2026 O Seu Nome" 
            value={options.watermarkText || ''} 
            onChange={(e) => onChange((prev) => ({ ...prev, watermarkText: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors"
          />
        </div>

        {(options.watermarkText && options.watermarkText.length > 0) && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Posição</label>
              <select 
                value={options.watermarkPosition || 'bottom-right'} 
                onChange={(e) => onChange((prev) => ({ ...prev, watermarkPosition: e.target.value as any }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-slate-900 dark:text-white sm:text-xs outline-none transition-colors"
              >
                <option value="bottom-right">Canto Inf. Direito</option>
                <option value="bottom-left">Canto Inf. Esquerdo</option>
                <option value="top-right">Canto Sup. Direito</option>
                <option value="top-left">Canto Sup. Esquerdo</option>
                <option value="center">Centro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Tamanho</label>
                  <span className="text-xs font-bold text-slate-500">{options.watermarkSize ?? 5}%</span>
                </div>
                <input 
                  type="range" min="1" max="25" step="1" 
                  value={options.watermarkSize ?? 5} 
                  onChange={(e) => onChange((prev) => ({ ...prev, watermarkSize: Number(e.target.value) }))} 
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Opacidade</label>
                  <span className="text-xs font-bold text-slate-500">{Math.round((options.watermarkOpacity ?? 0.5) * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.1" 
                  value={options.watermarkOpacity ?? 0.5} 
                  onChange={(e) => onChange((prev) => ({ ...prev, watermarkOpacity: parseFloat(e.target.value) }))} 
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      <div className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Formato de Saída</label>
          <select value={options.format} onChange={(e) => onChange((prev) => ({ ...prev, format: e.target.value as any }))} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors">
            <option value="image/jpeg">JPEG (.jpg)</option>
            <option value="image/png">PNG (.png)</option>
            <option value="image/webp">WebP (.webp)</option>
          </select>
        </div>
        
        {(options.format === 'image/jpeg' || options.format === 'image/webp') && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Limite de Tamanho (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" min="0" placeholder="Ex: 500"
                  value={options.targetSizeKB || ''} 
                  onChange={(e) => onChange((prev) => ({ ...prev, targetSizeKB: Number(e.target.value) }))} 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 sm:text-sm outline-none transition-colors" 
                />
                <span className="text-sm font-bold text-slate-500">KB</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Deixe em branco para ajuste manual.</p>
            </div>

            {(!options.targetSizeKB || options.targetSizeKB <= 0) && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Qualidade Manual</label>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{Math.round(options.quality * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={options.quality} onChange={(e) => onChange((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}