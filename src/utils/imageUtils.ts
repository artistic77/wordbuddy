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
export const processAndCompressImage = (
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      return reject(new Error('ไม่พบข้อมูลไฟล์ภาพ หรือไฟล์มีขนาด 0 byte กรุณาลองใหม่อีกครั้ง'));
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

    // Timeout guard: 15 seconds
    let isSettled = false;
    let objectUrl: string | null = null;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      clearTimeout(timeoutId);
    };

    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        reject(new Error('การโหลดรูปภาพใช้เวลานานเกินไป กรุณาลองเลือกรูปภาพใหม่อีกครั้ง'));
      }
    }, 15000);

    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      clearTimeout(timeoutId);
      return reject(new Error('ไม่สามารถสร้าง URL สำหรับอ่านรูปภาพได้'));
    }

    const img = new Image();

    img.onerror = (e) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      console.warn('[Image Utils] HTML Image element failed to render objectUrl:', e);
      if (isHeic) {
        reject(
          new Error(
            'รูปภาพเป็นรูปแบบ HEIC จากกล้องมือถือ ซึ่งเบราว์เซอร์ไม่รองรับ กรุณาเลือกไฟล์ JPG หรือ PNG หรือถ่ายภาพจากในแอปโดยตรง'
          )
        );
      } else {
        reject(new Error('ไม่สามารถถอดรหัสรูปภาพนี้ได้ กรุณาลองเลือกรูปอื่น'));
      }
    };

    img.onload = () => {
      if (isSettled) return;
      try {
        let { width, height } = img;
        if (width === 0 || height === 0) {
          width = 800;
          height = 600;
        }

        // Calculate scaled dimensions preserving aspect ratio
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
        if (!ctx) {
          throw new Error('Canvas 2D context is not supported on this device');
        }

        // Fill clean white background (useful for transparent PNGs)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw scaled image
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        console.log(
          `[Image Utils] Successfully compressed image from ${(file.size / 1024).toFixed(1)} KB to ${width}x${height}px (Base64 length: ${compressedBase64.length})`
        );

        isSettled = true;
        cleanup();
        resolve({
          base64: compressedBase64,
          mimeType: 'image/jpeg',
          width,
          height,
        });
      } catch (err: any) {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          reject(new Error(err?.message || 'การย่อขนาดภาพล้มเหลว กรุณาลองใหม่อีกครั้ง'));
        }
      }
    };

    img.src = objectUrl;
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
