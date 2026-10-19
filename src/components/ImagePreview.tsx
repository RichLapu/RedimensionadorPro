import { useMemo, useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageItem, CropData } from '@/hooks/useImageState';

// --- Sub-componente: Miniatura Arrastável ---
function SortableThumb({ id, url, isActive, onClick }: { id: string, url: string, isActive: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div 
      ref={setNodeRef} style={style} {...attributes} {...listeners} 
      onPointerDown={(e) => {
        // Permite clicar para selecionar sem disparar imediatamente o arrasto
        if (listeners?.onPointerDown) listeners.onPointerDown(e);
        onClick();
      }}
      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing touch-none ${
        isActive ? 'border-blue-600 dark:border-blue-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Thumb" className="w-full h-full object-cover pointer-events-none" />
    </div>
  );
}

// --- Componente Principal ---
interface ImagePreviewProps {
  items: ImageItem[];
  setItems: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  dimensions: { width: number; height: number };
  onRemove: (id: string) => void;
  onCrop: (id: string, cropData: CropData) => void;
}

export default function ImagePreview({ items, setItems, dimensions, onRemove, onCrop }: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const imageRef = useRef<HTMLImageElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Garante que o índice atual é válido após remoções ou reordenações
  useEffect(() => {
    if (currentIndex >= items.length) setCurrentIndex(Math.max(0, items.length - 1));
  }, [items.length, currentIndex]);

  const objectUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    items.forEach(item => { urls[item.id] = URL.createObjectURL(item.file); });
    return urls;
  }, [items]);

  useEffect(() => {
    return () => Object.values(objectUrls).forEach(url => URL.revokeObjectURL(url));
  }, [objectUrls]);

  const activeItem = items[currentIndex];
  const activeUrl = activeItem ? objectUrls[activeItem.id] : '';

  const totalSize = useMemo(() => {
    const bytes = items.reduce((acc, item) => acc + item.file.size, 0);
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  }, [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        if (currentIndex === oldIndex) setCurrentIndex(newIndex);
        else if (currentIndex === newIndex) setCurrentIndex(oldIndex);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleApplyCrop = () => {
    if (crop && imageRef.current && crop.width > 0 && crop.height > 0) {
      onCrop(activeItem.id, {
        x: crop.x, y: crop.y, width: crop.width, height: crop.height, unit: crop.unit || 'px'
      });
    }
    setIsCropModalOpen(false);
  };

  if (items.length === 0 || !activeItem) return null;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Imagens Originais ({items.length})</h3>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => { setCrop(undefined); setIsCropModalOpen(true); }}
              className="text-xs sm:text-sm flex items-center gap-1 font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.5 21.5V12.5M12.5 12.5H3.5M12.5 12.5L20.5 4.5M4 20L10 14" /></svg>
              <span className="hidden sm:inline">Recortar</span>
            </button>
            <button
              onClick={() => onRemove(activeItem.id)}
              className="text-xs sm:text-sm flex items-center gap-1 font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span className="hidden sm:inline">Remover</span>
            </button>
          </div>
        </div>

        <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-4 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeUrl} alt="Preview original" className="max-h-full w-auto object-contain" />
          {activeItem.crop && (
             <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">Recorte Ativo</div>
          )}
        </div>

        {/* DRAG & DROP CARROSSEL */}
        {items.length > 1 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-slate-500 mb-2">Arraste para reordenar:</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {items.map((item, idx) => (
                    <SortableThumb 
                      key={item.id} id={item.id} url={objectUrls[item.id]} 
                      isActive={currentIndex === idx} onClick={() => setCurrentIndex(idx)} 
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div><span className="font-semibold text-slate-900 dark:text-slate-200 block">Formato Atual</span>{activeItem.file.type.replace('image/', '').toUpperCase()}</div>
          <div><span className="font-semibold text-slate-900 dark:text-slate-200 block">Tamanho Total</span>{totalSize}</div>
        </div>
      </div>

      {/* MODAL DE RECORTE */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recortar Imagem</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-auto bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
              <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={imageRef} src={activeUrl} alt="Cortar" className="max-h-[60vh] w-auto object-contain" />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { onCrop(activeItem.id, { x: 0, y: 0, width: 0, height: 0, unit: 'px' }); setIsCropModalOpen(false); }} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors">Remover Recorte</button>
              <button onClick={handleApplyCrop} className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">Aplicar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}