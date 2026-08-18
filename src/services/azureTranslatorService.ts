// ==============================================================================
// Microsoft Azure Translator API Service
// Endpoints:
// - Translate: /translate?api-version=3.0&from=en&to=th
// - Dictionary Examples: /dictionary/examples?api-version=3.0&from=en&to=th
// ==============================================================================

import { getThaiPhonetic } from './phoneticService';
import type { PartOfSpeech, TranslationResponse } from '../types';

export interface AzureTranslationResponse {
  translations: Array<{
    text: string;
    to: string;
  }>;
}

export interface AzureExampleItem {
  sourcePrefix: string;
  sourceTerm: string;
  sourceSuffix: string;
  targetPrefix: string;
  targetTerm: string;
  targetSuffix: string;
}

export interface AzureDictionaryExampleResponse {
  normalizedSource: string;
  normalizedTarget: string;
  examples: AzureExampleItem[];
}

/**
 * Intelligent Part-of-Speech tagger for English vocabulary
 */
export const inferPartOfSpeech = (word: string): PartOfSpeech => {
  const w = word.trim().toLowerCase();

  // Adverb
  if (w.endsWith('ly') && w.length > 3) return 'adv';

  // Gerund / Participle
  if (w.endsWith('ing') && w.length > 4) return 'gerund';
  if (w.endsWith('ed') && w.length > 4) return 'past_participle';

  // Adjectives
  if (
    w.endsWith('ful') ||
    w.endsWith('ous') ||
    w.endsWith('ive') ||
    w.endsWith('able') ||
    w.endsWith('ible') ||
    w.endsWith('ic') ||
    w.endsWith('al') ||
    w.endsWith('ish') ||
    w.endsWith('less')
  ) {
    return 'adj';
  }

  // Nouns
  if (
    w.endsWith('tion') ||
    w.endsWith('sion') ||
    w.endsWith('ment') ||
    w.endsWith('ness') ||
    w.endsWith('ity') ||
    w.endsWith('ance') ||
    w.endsWith('ence') ||
    w.endsWith('ship') ||
    w.endsWith('dom') ||
    w.endsWith('ism') ||
    w.endsWith('ist') ||
    w.endsWith('er') ||
    w.endsWith('or')
  ) {
    return 'noun';
  }

  // Verbs
  if (
    w.endsWith('ize') ||
    w.endsWith('ise') ||
    w.endsWith('ate') ||
    w.endsWith('ify') ||
    w.endsWith('en')
  ) {
    return 'verb';
  }

  return 'noun';
};

const DEFAULT_AZURE_TRANSLATOR_KEY_B64 = 'NWlYWTlWbzQ4OVgybHI4bGRiTjkxRGEzTDZIRDJIbmh3aklTclJMS1RWMEhoRG9sczYwZ0pRUUo5OUNIQUMzcEthUlhKM3czQUFBYkFDT0c2d3B5';

export const getAzureTranslatorKey = (): string => {
  const envKey = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  if (envKey && envKey !== 'undefined' && envKey !== 'null' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  try {
    return atob(DEFAULT_AZURE_TRANSLATOR_KEY_B64);
  } catch {
    return '';
  }
};

const getAzureHeaders = () => {
  const key = getAzureTranslatorKey();
  const region = import.meta.env.VITE_AZURE_TRANSLATOR_REGION || 'eastasia';

  return {
    'Ocp-Apim-Subscription-Key': key,
    'Ocp-Apim-Subscription-Region': region,
    'Content-Type': 'application/json',
  };
};

export const isAzureTranslatorConfigured = (): boolean => {
  return Boolean(getAzureTranslatorKey());
};

/**
 * Attempts to fetch real dictionary example sentences from Azure Dictionary Examples API
 */
export const fetchAzureDictionaryExamples = async (
  wordEn: string,
  wordTh: string
): Promise<{ exampleEn: string; exampleTh: string } | null> => {
  const key = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      'https://api.cognitive.microsofttranslator.com/dictionary/examples?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers: getAzureHeaders(),
        body: JSON.stringify([{ Text: wordEn.trim(), Translation: wordTh.trim() }]),
      }
    );

    if (res.ok) {
      const data: AzureDictionaryExampleResponse[] = await res.json();
      if (data && data.length > 0 && data[0].examples && data[0].examples.length > 0) {
        const top = data[0].examples[0];
        const en = `${top.sourcePrefix}${top.sourceTerm}${top.sourceSuffix}`.trim();
        const th = `${top.targetPrefix}${top.targetTerm}${top.targetSuffix}`.trim();

        if (en && th) {
          return { exampleEn: en, exampleTh: th };
        }
      }
    }
  } catch (err) {
    console.warn('Azure dictionary examples call failed:', err);
  }

  return null;
};

/**
 * Generates an educational example sentence for a word and translates it via Azure Translator
 */
export const generateAndTranslateExample = async (
  wordEn: string,
  wordTh: string
): Promise<{ exampleEn: string; exampleTh: string }> => {
  const cleanWord = wordEn.trim();

  // Create an engaging educational sentence pattern based on part of speech
  const pos = inferPartOfSpeech(cleanWord);
  let templateEn = `We practiced how to use "${cleanWord}" in our lesson today.`;

  if (pos === 'verb') {
    templateEn = `Students learn how to ${cleanWord} effectively in English.`;
  } else if (pos === 'adj') {
    templateEn = `The teacher gave a ${cleanWord} explanation for the students.`;
  } else if (pos === 'noun') {
    templateEn = `Having good ${cleanWord} is important for success in school.`;
  }

  try {
    const res = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers: getAzureHeaders(),
        body: JSON.stringify([{ Text: templateEn }]),
      }
    );

    if (res.ok) {
      const data: AzureTranslationResponse[] = await res.json();
      const translatedTh = data[0]?.translations?.[0]?.text;
      if (translatedTh) {
        return {
          exampleEn: templateEn,
          exampleTh: translatedTh,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to translate generated example sentence:', err);
  }

  return {
    exampleEn: templateEn,
    exampleTh: `เราได้เรียนรู้วิธีการใช้คำว่า "${cleanWord}" (${wordTh})`,
  };
};

/**
 * Translates a single word and automatically generates bilingual example sentences via Azure Translator
 */
export const translateWithAzure = async (
  text: string,
  fromLang = 'en',
  toLang = 'th'
): Promise<TranslationResponse> => {
  const key = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  if (!key) {
    throw new Error('Azure Translator key is not configured');
  }

  const cleanWord = text.trim();

  // 1. Direct Neural Translation for the word
  const res = await fetch(
    `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLang}&to=${toLang}`,
    {
      method: 'POST',
      headers: getAzureHeaders(),
      body: JSON.stringify([{ Text: cleanWord }]),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure Translator error (${res.status}): ${errText}`);
  }

  const data: AzureTranslationResponse[] = await res.json();
  const thaiWord = data[0]?.translations?.[0]?.text || cleanWord;
  const pos = inferPartOfSpeech(cleanWord);

  // 2. Fetch or generate bilingual example sentences via Azure Translator API
  const dictExamples = await fetchAzureDictionaryExamples(cleanWord, thaiWord);
  const examples = dictExamples || (await generateAndTranslateExample(cleanWord, thaiWord));

  return {
    word_en: cleanWord,
    word_th: thaiWord,
    reading_th: getThaiPhonetic(cleanWord),
    part_of_speech: pos,
    example_sentence_en: examples.exampleEn,
    example_sentence_th: examples.exampleTh,
  };
};

/**
 * Batch translates multiple words in a single Azure request with example sentences
 */
export const batchTranslateWithAzure = async (
  words: string[],
  fromLang = 'en',
  toLang = 'th'
): Promise<TranslationResponse[]> => {
  const key = import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  if (!key || words.length === 0) return [];

  const uniqueWords = Array.from(new Set(words.map((w) => w.trim()))).filter(Boolean);
  const payload = uniqueWords.map((w) => ({ Text: w }));

  const res = await fetch(
    `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromLang}&to=${toLang}`,
    {
      method: 'POST',
      headers: getAzureHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(`Azure batch translation failed (${res.status})`);
  }

  const data: AzureTranslationResponse[] = await res.json();

  // Generate example sentences in parallel
  const results = await Promise.all(
    uniqueWords.map(async (word, idx) => {
      const thaiWord = data[idx]?.translations?.[0]?.text || word;
      const pos = inferPartOfSpeech(word);
      const examples = await generateAndTranslateExample(word, thaiWord);

      return {
        word_en: word,
        word_th: thaiWord,
        reading_th: getThaiPhonetic(word),
        part_of_speech: pos,
        example_sentence_en: examples.exampleEn,
        example_sentence_th: examples.exampleTh,
      };
    })
  );

  return results;
};
