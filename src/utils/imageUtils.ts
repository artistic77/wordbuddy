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
 */
export const processAndCompressImage = (
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<ProcessedImage> => {
  return new Promise((resolve, reject) => {
    // Validate file is an image
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|bmp|gif)$/i)) {
      reject(new Error('Selected file is not a supported image format.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data. Please try another picture.'));
      img.onload = () => {
        try {
          let { width, height } = img;

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
            // Fallback to original base64 if canvas 2D context fails
            resolve({
              base64: reader.result as string,
              mimeType: file.type || 'image/jpeg',
              width: img.width,
              height: img.height,
            });
            return;
          }

          // Fill white background (useful for PNG transparent worksheets)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve({
            base64: compressedBase64,
            mimeType: 'image/jpeg',
            width,
            height,
          });
        } catch (err) {
          // If canvas compression fails, fallback safely to original base64
          resolve({
            base64: reader.result as string,
            mimeType: file.type || 'image/jpeg',
            width: img.width,
            height: img.height,
          });
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};
