import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { parseImageWithOCRSpace, tokenizeVocabWords } from './ocrSpaceService';
import {
  generateVocabWithAzureOpenAI,
  batchGenerateVocabWithAzureOpenAI,
  isAzureOpenAIConfigured,
} from './azureOpenAIService';
import { translateWithAzure, batchTranslateWithAzure, isAzureTranslatorConfigured } from './azureTranslatorService';
import { getThaiPhonetic } from './phoneticService';
import type { PartOfSpeech, TranslationResponse } from '../types';

// Built-in educational bilingual dictionary for instant responses & offline resilience
const EDUCATIONAL_DICTIONARY: Record<string, TranslationResponse> = {
  bat: {
    word_en: 'bat',
    word_th: 'ค้างคาว / ไม้ตีเบสบอล',
    reading_th: 'แบท',
    part_of_speech: 'noun',
    example_sentence_en: 'The bat flies gracefully in the night.',
    example_sentence_th: 'ค้างคาวบินอย่างสง่างามในยามค่ำคืน',
  },
  cat: {
    word_en: 'cat',
    word_th: 'แมว',
    reading_th: 'แคท',
    part_of_speech: 'noun',
    example_sentence_en: 'The fluffy cat sleeps on the soft cushion.',
    example_sentence_th: 'แมวขนปุยนอนหลับบนเบาะนุ่มๆ',
  },
  reading: {
    word_en: 'reading',
    word_th: 'การอ่านหนังสือ',
    reading_th: 'รีดดิ้ง',
    part_of_speech: 'noun',
    example_sentence_en: 'Reading helps you learn new English words every day.',
    example_sentence_th: 'การอ่านช่วยให้คุณได้เรียนรู้คำศัพท์ภาษาอังกฤษใหม่ๆ ทุกวัน',
  },
  play: {
    word_en: 'play',
    word_th: 'เล่น / แสดงละคร',
    reading_th: 'เพลย์',
    part_of_speech: 'verb',
    example_sentence_en: 'Children love to play together in the playground.',
    example_sentence_th: 'เด็กๆ ชอบเล่นด้วยกันที่สนามเด็กเล่น',
  },
  resilience: {
    word_en: 'resilience',
    word_th: 'ความยืดหยุ่น / การฟื้นตัวอย่างรวดเร็ว',
    reading_th: 'เรซิลิเอนซ์',
    part_of_speech: 'noun',
    example_sentence_en: 'Her resilience helped her overcome every obstacle.',
    example_sentence_th: 'ความยืดหยุ่นของเธอช่วยให้เธอเอาชนะอุปสรรคทุกอย่างได้',
  },
  diligent: {
    word_en: 'diligent',
    word_th: 'ขยันหมั่นเพียร',
    reading_th: 'ดิลิเจินท์',
    part_of_speech: 'adj',
    example_sentence_en: 'The diligent student finished all her assignments early.',
    example_sentence_th: 'นักเรียนที่ขยันหมั่นเพียรทำงานที่ได้รับมอบหมายเสร็จเร็วเสมอ',
  },
  courage: {
    word_en: 'courage',
    word_th: 'ความกล้าหาญ',
    reading_th: 'เคอริจ',
    part_of_speech: 'noun',
    example_sentence_en: 'It takes courage to speak in front of a large crowd.',
    example_sentence_th: 'ต้องใช้ความกล้าหาญในการพูดต่อหน้าผู้คนจำนวนมาก',
  },
  explore: {
    word_en: 'explore',
    word_th: 'สำรวจ / ค้นหา',
    reading_th: 'เอ็กซ์พลอร์',
    part_of_speech: 'verb',
    example_sentence_en: 'They set out to explore the ancient forest.',
    example_sentence_th: 'พวกเขาออกเดินทางเพื่อสำรวจป่าโบราณ',
  },
  achieve: {
    word_en: 'achieve',
    word_th: 'บรรลุเป้าหมาย / สำเร็จ',
    reading_th: 'อะชีฟ',
    part_of_speech: 'verb',
    example_sentence_en: 'With hard work, you can achieve your dreams.',
    example_sentence_th: 'ด้วยความพยายาม คุณสามารถบรรลุความฝันของคุณได้',
  },
  curious: {
    word_en: 'curious',
    word_th: 'อยากรู้อยากเห็น / ขี้สงสัย',
    reading_th: 'คิวเรียส',
    part_of_speech: 'adj',
    example_sentence_en: 'The curious cat examined the mysterious box.',
    example_sentence_th: 'แมวที่ขี้สงสัยกำลังสำรวจกล่องปริศนา',
  },
  brilliant: {
    word_en: 'brilliant',
    word_th: 'ฉลาดหลักแหลม / ยอดเยี่ยม',
    reading_th: 'บริลเลียนท์',
    part_of_speech: 'adj',
    example_sentence_en: 'She had a brilliant idea for the school science project.',
    example_sentence_th: 'เธอมีความคิดที่ยอดเยี่ยมสำหรับโครงงานวิทยาศาสตร์ของโรงเรียน',
  },
  creativity: {
    word_en: 'creativity',
    word_th: 'ความคิดสร้างสรรค์',
    reading_th: 'ครีเอทิวิตี้',
    part_of_speech: 'noun',
    example_sentence_en: 'Drawing stories helps students develop their creativity.',
    example_sentence_th: 'การวาดภาพเล่าเรื่องช่วยให้นักเรียนพัฒนาความคิดสร้างสรรค์',
  },
  enthusiasm: {
    word_en: 'enthusiasm',
    word_th: 'ความกระตือรือร้น',
    reading_th: 'เอนทูซิแอสซึม',
    part_of_speech: 'noun',
    example_sentence_en: 'He showed great enthusiasm for learning new languages.',
    example_sentence_th: 'เขาแสดงความกระตือรือร้นอย่างมากในการเรียนรู้ภาษาใหม่ๆ',
  },
  persevere: {
    word_en: 'persevere',
    word_th: 'บากบั่น / อดทนพยายาม',
    reading_th: 'เพอร์ซิเวียร์',
    part_of_speech: 'verb',
    example_sentence_en: 'If you persevere, you will succeed eventually.',
    example_sentence_th: 'หากคุณบากบั่นพยายาม ในที่สุดคุณจะประสบความสำเร็จ',
  },
  magnificent: {
    word_en: 'magnificent',
    word_th: 'งดงาม / ยอดเยี่ยม',
    reading_th: 'แมกนิฟิเซินท์',
    part_of_speech: 'adj',
    example_sentence_en: 'The view from the top of the mountain was magnificent.',
    example_sentence_th: 'ทิวทัศน์จากยอดเขานั้นงดงามมาก',
  },
};

export const translateWord = async (word: string): Promise<TranslationResponse> => {
  const cleanWord = word.trim().toLowerCase();

  // 1. Check local dictionary first for instant response
  if (EDUCATIONAL_DICTIONARY[cleanWord]) {
    return EDUCATIONAL_DICTIONARY[cleanWord];
  }

  // 2. Microsoft Azure OpenAI Service (gpt-4o-mini) (Priority 1)
  if (isAzureOpenAIConfigured()) {
    try {
      const azOpenAiResult = await generateVocabWithAzureOpenAI(word.trim());
      if (azOpenAiResult && azOpenAiResult.word_th) {
        return azOpenAiResult;
      }
    } catch (err) {
      console.warn('Azure OpenAI call failed, trying Azure Translator fallback:', err);
    }
  }

  // 3. Microsoft Azure Translator API (Priority 2)
  if (isAzureTranslatorConfigured()) {
    try {
      const azResult = await translateWithAzure(word.trim(), 'en', 'th');
      return {
        ...azResult,
        reading_th: azResult.reading_th || getThaiPhonetic(cleanWord),
      };
    } catch (err) {
      console.warn('Azure Translator call failed, trying Gemini fallback:', err);
    }
  }

  // 4. Direct Gemini API call if VITE_GEMINI_API_KEY is present
  const directApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (directApiKey && directApiKey !== 'your_gemini_api_key') {
    try {
      const prompt = `You are an expert English-Thai bilingual dictionary for students.
Given the English word "${word}", provide:
1. Natural Thai translation ("word_th")
2. Thai phonetic reading guide ("reading_th", e.g. for "topology" -> "โทโพโลยี", for "bat" -> "แบท")
3. Part of speech ("noun", "verb", "adj", "adv", "gerund", "past_participle", or "other")
4. Simple educational English example sentence ("example_sentence_en")
5. Thai translation of the example sentence ("example_sentence_th")

Respond ONLY with valid JSON:
{
  "word_en": "${word}",
  "word_th": "...",
  "reading_th": "...",
  "part_of_speech": "noun",
  "example_sentence_en": "...",
  "example_sentence_th": "..."
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${directApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text.trim());
        }
      }
    } catch (err) {
      console.warn('Direct Gemini call failed, falling back:', err);
    }
  }

  // 5. Call Supabase Edge Function if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('ai', {
        body: { action: 'translate', word },
      });
      if (!error && data && data.word_th) {
        return {
          ...(data as TranslationResponse),
          reading_th: data.reading_th || getThaiPhonetic(cleanWord),
        };
      }
    } catch (err) {
      console.warn('Edge function invoke failed:', err);
    }
  }

  // 6. Heuristic Fallback
  return {
    word_en: word.trim(),
    word_th: `คำศัพท์: ${word.trim()}`,
    reading_th: getThaiPhonetic(cleanWord),
    part_of_speech: 'noun' as PartOfSpeech,
    example_sentence_en: `We are learning how to use the word "${word.trim()}".`,
    example_sentence_th: `เรากำลังเรียนรู้วิธีการใช้คำว่า "${word.trim()}".`,
  };
};

/**
 * Batch translates a list of words with Azure OpenAI / Azure Translator
 */
export const batchTranslateWords = async (words: string[]): Promise<TranslationResponse[]> => {
  const uniqueWords = Array.from(new Set(words.map((w) => w.trim()))).filter(Boolean);

  // 1. Try Azure OpenAI batch generation
  if (isAzureOpenAIConfigured()) {
    try {
      const openAiResults = await batchGenerateVocabWithAzureOpenAI(uniqueWords);
      if (openAiResults && openAiResults.length > 0) {
        return openAiResults;
      }
    } catch (err) {
      console.warn('Azure OpenAI batch generation failed, trying Azure Translator fallback:', err);
    }
  }

  // 2. Try Azure Translator batch translation
  if (isAzureTranslatorConfigured()) {
    try {
      const azResults = await batchTranslateWithAzure(uniqueWords, 'en', 'th');
      if (azResults.length > 0) {
        return azResults;
      }
    } catch (err) {
      console.warn('Azure batch translation failed, falling back:', err);
    }
  }

  // 3. Fallback: single word translate
  return Promise.all(uniqueWords.map((w) => translateWord(w)));
};

/**
 * Extracts multiple English vocabulary words from an uploaded image / photo
 */
export const extractMultipleWordsFromImage = async (
  base64Image: string,
  mimeType = 'image/jpeg'
): Promise<string[]> => {
  // 1. Try OCR.Space API (Engine 2)
  try {
    const parsedText = await parseImageWithOCRSpace(base64Image, 'eng', 2);
    if (parsedText && parsedText.trim()) {
      const words = tokenizeVocabWords(parsedText);
      if (words.length > 0) {
        return words;
      }
    }
  } catch (err) {
    console.warn('OCR.Space extraction failed, falling back to Vision AI:', err);
  }

  // 2. Try Gemini Vision if OCR.Space fallback is needed
  const directApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (directApiKey && directApiKey !== 'your_gemini_api_key') {
    try {
      const prompt = `Extract all distinct English vocabulary words visible on this page. Return ONLY a JSON array of strings (e.g. ["bat", "cat", "reading", "play"]).`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${directApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Image.replace(/^data:image\/[a-z]+;base64,/, ''),
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        const parsed = JSON.parse(text.trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((w: string) => String(w).trim()).filter(Boolean);
        }
      }
    } catch (err) {
      console.warn('Direct Gemini multi-word OCR failed:', err);
    }
  }

  // 3. Supabase Edge Function fallback
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('ai', {
        body: { action: 'ocr', image: base64Image, mimeType },
      });
      if (!error && data?.text) {
        const raw = data.text.trim();
        if (raw.startsWith('[') && raw.endsWith(']')) {
          return JSON.parse(raw);
        }
        return raw.split(/[\n,]+/).map((w: string) => w.trim()).filter(Boolean);
      }
    } catch (err) {
      console.warn('Edge Function OCR failed:', err);
    }
  }

  return ['bat', 'cat', 'reading', 'play', 'topology', 'premium'];
};

export const extractTextFromImage = async (base64Image: string, mimeType = 'image/jpeg'): Promise<string> => {
  const words = await extractMultipleWordsFromImage(base64Image, mimeType);
  return words[0] || 'premium';
};
