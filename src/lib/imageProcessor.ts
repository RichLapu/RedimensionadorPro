import { ImageOptions, CropData } from '@/hooks/useImageState';

export interface ProcessedImageResult {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  sizeBytes: number;
}

export const processImage = (file: File, options: ImageOptions, cropData?: CropData): Promise<ProcessedImageResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Falha ao obter contexto do canvas'));

      if (cropData && cropData.width > 0 && cropData.height > 0) {
        const cropX = cropData.unit === '%' ? (cropData.x * img.width) / 100 : cropData.x;
        const cropY = cropData.unit === '%' ? (cropData.y * img.height) / 100 : cropData.y;
        const cropW = cropData.unit === '%' ? (cropData.width * img.width) / 100 : cropData.width;
        const cropH = cropData.unit === '%' ? (cropData.height * img.height) / 100 : cropData.height;
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, options.width, options.height);
      } else {
        ctx.drawImage(img, 0, 0, options.width, options.height);
      }

      if (options.watermarkText && options.watermarkText.trim().length > 0) {
        // Agora usa o watermarkSize dinâmico (com min. de 12px para evitar desaparecer em imagens ínfimas)
        const sizePercent = options.watermarkSize ?? 5;
        const fontSize = Math.max(12, Math.floor(options.width * (sizePercent / 100)));
        
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${options.watermarkOpacity ?? 0.5})`;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = Math.max(2, Math.floor(fontSize * 0.1));
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const padding = Math.floor(fontSize * 0.5);
        let textX = padding;
        let textY = padding;

        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        switch (options.watermarkPosition) {
          case 'top-right':
            textX = options.width - padding;
            ctx.textAlign = 'right';
            break;
          case 'bottom-left':
            textY = options.height - padding;
            ctx.textBaseline = 'bottom';
            break;
          case 'bottom-right':
            textX = options.width - padding;
            textY = options.height - padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
          case 'center':
            textX = options.width / 2;
            textY = options.height / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            break;
        }

        ctx.fillText(options.watermarkText, textX, textY);
        ctx.shadowColor = 'transparent';
      }

      const isLossy = options.format === 'image/jpeg' || options.format === 'image/webp';
      
      if (isLossy && options.targetSizeKB && options.targetSizeKB > 0) {
        const targetBytes = options.targetSizeKB * 1024;
        let minQuality = 0.01;
        let maxQuality = 1.0;
        let bestBlob: Blob | null = null;
        let attempts = 0;
        const maxAttempts = 7;

        const attemptCompression = () => {
          if (attempts >= maxAttempts) return finalize(bestBlob!);
          const currentQuality = (minQuality + maxQuality) / 2;
          
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Erro na compressão'));
            if (!bestBlob || blob.size <= targetBytes) bestBlob = blob;

            if (blob.size > targetBytes) maxQuality = currentQuality;
            else minQuality = currentQuality;
            
            attempts++;
            attemptCompression();
          }, options.format, currentQuality);
        };
        attemptCompression();
      } else {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Erro ao processar imagem'));
          finalize(blob);
        }, options.format, options.quality);
      }
      
      function finalize(finalBlob: Blob) {
        resolve({
          url: URL.createObjectURL(finalBlob),
          blob: finalBlob,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: finalBlob.size
        });
      }
    };

    img.onerror = () => reject(new Error('Erro ao carregar a imagem'));
    img.src = objectUrl;
  });
};