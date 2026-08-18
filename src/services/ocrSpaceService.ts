// ==============================================================================
// OCR.Space API Service (https://ocr.space/ocrapi#selectocrengine)
// Supports OCR Engine 1 & 2 for high accuracy text extraction from photos
// ==============================================================================

export interface OCRSpaceParsedResult {
  ParsedText: string;
  ErrorMessage?: string;
  ErrorDetails?: string;
  FileParseExitCode: number;
}

export interface OCRSpaceResponse {
  ParsedResults?: OCRSpaceParsedResult[];
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string[];
  ErrorDetails?: string;
}

/**
 * Calls OCR.Space API to parse image base64 and extract text
 * @param base64Image - Data URL or raw base64 string of image
 * @param language - Language code ('eng', 'tha', etc.)
 * @param ocrEngine - '1' (standard) or '2' (high accuracy, recommended for mixed text/mobile)
 */
export const parseImageWithOCRSpace = async (
  base64Image: string,
  language = 'eng',
  ocrEngine: 1 | 2 = 2
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OCR_SPACE_API_KEY || 'K88374823888957'; // user key or fallback

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append('base64Image', base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`);
  formData.append('language', language);
  formData.append('OCREngine', String(ocrEngine));
  formData.append('scale', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('isTable', 'false');

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`OCR.Space API error (${res.status}): ${res.statusText}`);
  }

  const data: OCRSpaceResponse = await res.json();

  if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
    const errorMsg = data.ErrorMessage?.join(', ') || data.ErrorDetails || 'Failed to parse image with OCR.Space';
    throw new Error(errorMsg);
  }

  return data.ParsedResults.map((r) => r.ParsedText).join('\n');
};

/**
 * Tokenizes raw OCR text into a clean list of distinct vocabulary words
 */
export const tokenizeVocabWords = (rawText: string): string[] => {
  if (!rawText || !rawText.trim()) return [];

  // Split by newlines, bullets, numbering, or common delimiters
  const lines = rawText
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const words: string[] = [];

  // Stop words to filter out if appearing as isolated entries
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'by', 'it', 'its', 'this', 'that', 'page', 'unit', 'chapter', 'lesson', 'vocabulary', 'vocab', 'date', 'name', 'class', 'no'
  ]);

  for (const line of lines) {
    // Remove leading numbering like "1. ", "2) ", "• ", "- "
    const cleanedLine = line.replace(/^(\d+[\.\)]|\-|\*|•)\s*/, '').trim();

    // Check if line contains a word with meaning or definition like "resilience - ความยืดหยุ่น"
    const parts = cleanedLine.split(/[:\-\—\=]/);
    const mainWord = parts[0].trim();

    // Remove non-alphabetic chars except hyphen
    const candidate = mainWord.replace(/[^a-zA-Z\s\-]/g, '').trim();

    if (candidate.length >= 2) {
      // If it's a short phrase (1-3 words)
      const tokenCount = candidate.split(/\s+/).length;
      if (tokenCount <= 3 && !stopWords.has(candidate.toLowerCase())) {
        words.push(candidate);
      } else if (tokenCount > 3) {
        // Break down longer lines into individual meaningful words
        const individualTokens = candidate.split(/\s+/);
        for (const token of individualTokens) {
          const tClean = token.trim();
          if (tClean.length >= 3 && !stopWords.has(tClean.toLowerCase())) {
            words.push(tClean);
          }
        }
      }
    }
  }

  // Return unique words preserving original casing/cased appropriately
  const seen = new Set<string>();
  const uniqueList: string[] = [];

  for (const w of words) {
    const lower = w.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      uniqueList.push(w);
    }
  }

  return uniqueList;
};
