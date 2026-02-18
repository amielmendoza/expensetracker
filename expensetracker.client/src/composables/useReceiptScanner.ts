import { ref } from 'vue';
import { aiService } from '@/services/api/aiService';
import type { ReceiptScanResult } from '@/types/ai';

export function useReceiptScanner() {
  const scanning = ref(false);
  const result = ref<ReceiptScanResult | null>(null);
  const error = ref<string | null>(null);
  const preview = ref<string | null>(null);

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1500;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          // Strip the data:image/jpeg;base64, prefix
          const base64 = dataUrl.split(',')[1] || '';
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function scanReceipt(file: File): Promise<ReceiptScanResult | null> {
    // Validate
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select an image file';
      return null;
    }
    if (file.size > 10_000_000) {
      error.value = 'Image too large. Max 10MB.';
      return null;
    }

    scanning.value = true;
    error.value = null;
    result.value = null;

    // Set preview
    preview.value = URL.createObjectURL(file);

    try {
      const base64 = await compressImage(file);
      const scanResult = await aiService.scanReceipt(base64);
      result.value = scanResult;
      return scanResult;
    } catch (err: any) {
      error.value = err.message || 'Failed to scan receipt';
      return null;
    } finally {
      scanning.value = false;
    }
  }

  function clearResult() {
    result.value = null;
    error.value = null;
    scanning.value = false;
    if (preview.value) {
      URL.revokeObjectURL(preview.value);
      preview.value = null;
    }
  }

  return {
    scanning,
    result,
    error,
    preview,
    scanReceipt,
    clearResult,
  };
}
