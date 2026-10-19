import { useState, useEffect } from 'react';
import { processImage, ProcessedImageResult } from '@/lib/imageProcessor';

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

export interface ImageItem {
  id: string;
  file: File;
  crop?: CropData;
}

export interface ImageOptions {
  width: number;
  height: number;
  keepAspectRatio: boolean;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  targetSizeKB?: number;
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermarkSize?: number; // NOVA PROPRIEDADE
}

export function useImageState() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const [options, setOptions] = useState<ImageOptions>({
    width: 1920,
    height: 1080,
    keepAspectRatio: true,
    format: 'image/jpeg',
    quality: 0.8,
    targetSizeKB: 0,
    watermarkText: '',
    watermarkOpacity: 0.5,
    watermarkPosition: 'bottom-right',
    watermarkSize: 5, // Tamanho padrão: 5% da imagem
  });

  const addFiles = (files: File[]) => {
    const newItems = files.map(file => ({ id: crypto.randomUUID(), file }));
    setItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (idToRemove: string) => {
    setItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const updateCrop = (id: string, cropData: CropData) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, crop: cropData } : item));
  };

  const clearItems = () => setItems([]);

  useEffect(() => {
    if (items.length > 0) {
      const firstFile = items[0].file;
      const img = new Image();
      const objectUrl = URL.createObjectURL(firstFile);
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    } else {
      setOriginalDimensions({ width: 0, height: 0 });
      setResults([]);
    }
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;
    let isCancelled = false;
    
    const processAll = async () => {
      setIsProcessing(true);
      try {
        const newResults = await Promise.all(
          items.map(item => processImage(item.file, options, item.crop))
        );
        if (!isCancelled) setResults(newResults);
      } catch (error) {
        console.error("Erro ao processar as imagens em lote:", error);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timeoutId = setTimeout(processAll, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [items, options]);

  return { items, setItems, addFiles, removeItem, updateCrop, clearItems, options, setOptions, originalDimensions, results, isProcessing };
}