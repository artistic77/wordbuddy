/**
 * Image processing utilities for Word Buddy
 * Resizes and compresses images client-side before sending to Multimodal AI Vision
 * Optimized for mobile devices, low memory, and Android WebView in LINE LIFF.
 */

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Optimizes an uploaded image or camera snapshot:
 * - Uses URL.createObjectURL to stream the image without hogging RAM
 * - Resizes max dimensions to `maxDimension` (default 1600px) preserving aspect ratio
 * - Compresses to standard JPEG with `quality` (default 0.85)
 * - Returns clean base64 data URL
 * - Includes a 15-second timeout to prevent indefinite hangs in WebViews
 */
export const processAndCompressImage = async (
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ProcessedImage> => {
  if (!file || file.size === 0) {
    throw new Error('ไม่พบข้อมูลไฟล์ภาพ หรือไฟล์มีขนาด 0 byte กรุณาลองใหม่อีกครั้ง');
  }

  // Check for HEIC/HEIF
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  console.log(
    `[Image Utils] Processing file: "${file.name}" | Size: ${(file.size / 1024).toFixed(1)} KB | Type: "${file.type}"`
  );

  // Strategy 1: Native createImageBitmap (Fastest, hardware accelerated, supported in Android WebView 50+)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      console.log('[Image Utils] Decoding image via createImageBitmap...');
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;

      if (width === 0 || height === 0) {
        width = 800;
        height = 600;
      }

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close(); // release native GPU memory immediately

        const base64 = canvas.toDataURL('image/jpeg', quality);
        console.log(`[Image Utils] createImageBitmap success: ${width}x${height}px (Base64 length: ${base64.length})`);
        return {
          base64,
          mimeType: 'image/jpeg',
          width,
          height,
        };
      }
    } catch (bitmapErr) {
      console.warn('[Image Utils] createImageBitmap failed, falling back to FileReader DataURL:', bitmapErr);
      if (isHeic) {
        throw new Error(
          'รูปภาพเป็นรูปแบบ HEIC จากกล้องมือถือ ซึ่งระบบไม่รองรับ กรุณาเลือกไฟล์ JPG หรือ PNG หรือกดถ่ายภาพจากในแอปโดยตรง'
        );
      }
    }
  }

  // Strategy 2: FileReader Data URL + Image (Universal fallback for all WebViews)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const timeoutId = setTimeout(() => {
      reject(new Error('การโหลดรูปภาพใช้เวลานานเกินไป กรุณาลองเลือกรูปภาพใหม่อีกครั้ง'));
    }, 15000);

    reader.onerror = (err) => {
      clearTimeout(timeoutId);
      console.error('[Image Utils] FileReader failed:', err);
      reject(new Error('ไม่สามารถอ่านไฟล์ภาพจากเครื่องได้'));
    };

    reader.onload = () => {
      clearTimeout(timeoutId);
      const dataUrl = reader.result as string;
      if (!dataUrl || dataUrl.length < 50) {
        return reject(new Error('ข้อมูลไฟล์ภาพไม่สมบูรณ์'));
      }

      const img = new Image();
      img.onerror = () => {
        if (isHeic) {
          reject(
            new Error(
              'รูปภาพเป็นรูปแบบ HEIC จากกล้องมือถือ ซึ่งระบบไม่รองรับ กรุณาเลือกไฟล์ JPG หรือ PNG หรือกดถ่ายภาพจากในแอปโดยตรง'
            )
          );
        } else {
          reject(new Error('ไม่สามารถถอดรหัสรูปภาพนี้ได้ กรุณาลองเลือกรูปอื่น'));
        }
      };

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width === 0 || height === 0) {
            width = 800;
            height = 600;
          }

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas 2D context unavailable');

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', quality);
          console.log(`[Image Utils] FileReader fallback success: ${width}x${height}px`);
          resolve({
            base64,
            mimeType: 'image/jpeg',
            width,
            height,
          });
        } catch (err: any) {
          reject(new Error(err?.message || 'การย่อขนาดภาพล้มเหลว'));
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Compresses an HTMLCanvasElement snapshot (from in-app camera viewfinder)
 */
export const processCanvasSnapshot = (
  canvas: HTMLCanvasElement,
  maxDimension = 1600,
  quality = 0.85
): ProcessedImage => {
  let { width, height } = canvas;
  let targetCanvas = canvas;

  if (width > maxDimension || height > maxDimension) {
    let newWidth = width;
    let newHeight = height;
    if (width > height) {
      newHeight = Math.round((height * maxDimension) / width);
      newWidth = maxDimension;
    } else {
      newWidth = Math.round((width * maxDimension) / height);
      newHeight = maxDimension;
    }

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = newWidth;
    scaledCanvas.height = newHeight;
    const ctx = scaledCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, newWidth, newHeight);
      ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
      targetCanvas = scaledCanvas;
      width = newWidth;
      height = newHeight;
    }
  }

  const base64 = targetCanvas.toDataURL('image/jpeg', quality);
  return {
    base64,
    mimeType: 'image/jpeg',
    width,
    height,
  };
};
