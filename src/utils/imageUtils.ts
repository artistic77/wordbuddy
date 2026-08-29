/**
 * Image processing utilities for Word Buddy
 * Resizes and compresses images client-side before sending to Multimodal AI Vision
 */

export interface ProcessedImage {
  base64: string;
  mimeType: string;
  width: number;
  height: number;
}

/**
 * Optimizes an uploaded image or camera snapshot:
 * - Resizes max dimensions to `maxDimension` (default 1600px) preserving aspect ratio
 * - Compresses to standard JPEG with `quality` (default 0.85)
 * - Returns clean base64 data URL
 * - Always falls back safely to original file base64 if canvas processing is not supported
 */
export const processAndCompressImage = (
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ProcessedImage> => {
  return new Promise((resolve) => {
    console.log(`[Image Utils] Selected file: "${file.name}" | Size: ${(file.size / 1024).toFixed(1)} KB | Type: "${file.type}"`);

    const reader = new FileReader();

    reader.onerror = () => {
      console.warn('[Image Utils] FileReader failed to read file.');
      resolve({
        base64: '',
        mimeType: file.type || 'image/jpeg',
        width: 0,
        height: 0,
      });
    };

    reader.onload = () => {
      const rawBase64 = reader.result as string;

      // Create an image element to attempt scaling & JPEG compression
      const img = new Image();

      img.onerror = (e) => {
        console.warn('[Image Utils] HTML Image element failed to render (possibly HEIC/RAW or non-standard format). Falling back to direct raw base64:', e);
        resolve({
          base64: rawBase64,
          mimeType: file.type || 'image/jpeg',
          width: 0,
          height: 0,
        });
      };

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width === 0 || height === 0) {
            resolve({
              base64: rawBase64,
              mimeType: file.type || 'image/jpeg',
              width: 0,
              height: 0,
            });
            return;
          }

          // Calculate scaled dimensions
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
            console.warn('[Image Utils] 2D canvas context unavailable, using original base64.');
            resolve({
              base64: rawBase64,
              mimeType: file.type || 'image/jpeg',
              width: img.width,
              height: img.height,
            });
            return;
          }

          // Fill clean white background (useful for transparent PNGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          console.log(`[Image Utils] Successfully compressed image from ${(file.size / 1024).toFixed(1)} KB to ${width}x${height}px (Base64 length: ${compressedBase64.length})`);

          resolve({
            base64: compressedBase64,
            mimeType: 'image/jpeg',
            width,
            height,
          });
        } catch (err) {
          console.warn('[Image Utils] Canvas compression failed, falling back to raw base64:', err);
          resolve({
            base64: rawBase64,
            mimeType: file.type || 'image/jpeg',
            width: img.width || 0,
            height: img.height || 0,
          });
        }
      };

      img.src = rawBase64;
    };

    reader.readAsDataURL(file);
  });
};
