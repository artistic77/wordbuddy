// ==============================================================================
// Google AI Studio Service (Gemini API)
// Provides fast, high-quality Thai pronunciation, meanings, vision extraction,
// and prompt-based vocabulary generation.
// ==============================================================================

import type { TranslationResponse, PartOfSpeech } from '../types';
import { COMMON_PHONETICS, getThaiPhonetic } from './phoneticService';

export interface ExtractedVocabSheet {
  title?: string;
  words: string[];
  entries?: TranslationResponse[];
}

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];

export const getGeminiApiKey = (): string => {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (
    envKey &&
    envKey !== 'undefined' &&
    envKey !== 'null' &&
    envKey !== 'your_gemini_api_key' &&
    envKey.trim().length > 5
  ) {
    return envKey.trim();
  }
  return '';
};

export const getGeminiModel = (): string => {
  const model = import.meta.env.VITE_GEMINI_MODEL;
  if (model && model.trim()) {
    return model.trim();
  }
  return DEFAULT_GEMINI_MODEL;
};

export const isGeminiConfigured = (): boolean => {
  return Boolean(getGeminiApiKey());
};

interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiRequestBody {
  systemInstruction?: {
    parts: { text: string }[];
  };
  contents: {
    role?: 'user' | 'model';
    parts: GeminiContentPart[];
  }[];
  generationConfig?: {
    temperature?: number;
    responseMimeType?: string;
    maxOutputTokens?: number;
  };
}

/**
 * Executes a call to Google AI Studio REST API with model fallback support
 */
export const callGeminiApi = async (body: GeminiRequestBody): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Google AI Studio API Key (VITE_GEMINI_API_KEY) is not configured');
  }

  const primaryModel = getGeminiModel();
  const modelsToTry = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Empty response content received from Gemini API');
        }
        return text;
      }

      const errText = await res.text();
      const errStatus = res.status;
      console.warn(`[Gemini API] Model ${model} returned error status ${errStatus}: ${errText}`);

      // If model not found or unsupported on this tier, try next fallback model
      if (errStatus === 404 || errStatus === 400) {
        lastError = new Error(`Gemini API (${model}) failed [${errStatus}]: ${errText}`);
        continue;
      }

      throw new Error(`Gemini API Error [${errStatus}]: ${errText}`);
    } catch (err: any) {
      lastError = err;
      if (err.name === 'AbortError' || err.message?.includes('network')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to complete Gemini API call across available models');
};

/**
 * Normalizes JSON string from LLM responses (stripping markdown codeblocks if any)
 */
const cleanAndParseJson = (rawText: string): any => {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned);
};

const normalizePartOfSpeech = (pos?: string): PartOfSpeech => {
  const validPos: PartOfSpeech[] = ['noun', 'verb', 'adj', 'adv', 'gerund', 'past_participle', 'other'];
  const lower = String(pos || '').toLowerCase().trim();
  if (lower === 'adjective') return 'adj';
  if (lower === 'adverb') return 'adv';
  if (validPos.includes(lower as PartOfSpeech)) {
    return lower as PartOfSpeech;
  }
  return 'noun';
};

/**
 * Generates rich bilingual vocabulary details for a single English word using Google AI Studio (Gemini)
 */
export const generateVocabWithGemini = async (word: string): Promise<TranslationResponse> => {
  const cleanWord = word.trim();
  console.log(`[Gemini] Generating vocabulary details for: "${cleanWord}"...`);

  const systemPrompt = `You are a world-class English-Thai educational linguist, dictionary editor, and phonetic specialist for Thai schools.

For any given English vocabulary word or phrase, you MUST provide accurate bilingual details with STRICT separation between Thai Meaning (word_th) and Thai Phonetic Reading (reading_th):

1. "word_en": The English word properly formatted.
2. "word_th": The accurate, natural Thai MEANING / TRANSLATION (ความหมาย/คำแปลภาษาไทย).
   - Examples of MEANING: "method" -> "วิธีการ / วิธี", "chicken" -> "ไก่ / เนื้อไก่", "bat" -> "ค้างคาว / ไม้เบสบอล", "nest" -> "รังนก", "diligent" -> "ขยันหมั่นเพียร".
   - CRITICAL: NEVER put phonetic reading/transliteration in "word_th".
3. "reading_th": The standard Thai PHONETIC PRONUNCIATION guide (คำอ่านออกเสียงของคำภาษาอังกฤษเป็นอักษรไทย).
   - Examples of READING: "method" -> "เมธอด", "chicken" -> "ชิกเก้น", "bat" -> "แบท", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์".
   - CRITICAL: NEVER put the Thai meaning in "reading_th".
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": Clear educational English example sentence using the word.
6. "example_sentence_th": Natural Thai translation of the example sentence.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "january" -> "แจนยัวรี่" (Meaning: "เดือนมกราคม")
   - "february" -> "เฟบรัวรี่" (Meaning: "เดือนกุมภาพันธ์")
   - "march" -> "มาร์ช" (Meaning: "เดือนมีนาคม")
   - "august" -> "ออกัสต์" (Meaning: "เดือนสิงหาคม")
   - "bat" -> "แบท"
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "girl" -> "เกิร์ล", "bird" -> "เบิร์ด", "world" -> "เวิลด์"
   - "method" -> "เมธอด"
2. Final -st -> "สต์", -ch/-tch -> "ทช์"/"ช์", -en/-in -> "เก้น"/"เซ่น".
3. Respond ONLY in valid JSON matching the schema.`;

  const userPrompt = `English word: "${cleanWord}"
Return JSON schema:
{
  "word_en": "${cleanWord}",
  "word_th": "ความหมายภาษาไทย",
  "reading_th": "คำอ่านออกเสียงภาษาไทย",
  "part_of_speech": "noun",
  "example_sentence_en": "Example sentence in English",
  "example_sentence_th": "คำแปลประโยคตัวอย่างภาษาไทย"
}`;

  const text = await callGeminiApi({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const parsed = cleanAndParseJson(text);
  const wordClean = parsed.word_en || cleanWord;
  const wordLower = wordClean.toLowerCase();
  const rawReading = String(parsed.reading_th || '').trim();
  const rawMeaning = String(parsed.word_th || cleanWord).trim();
  const validReading =
    COMMON_PHONETICS[wordLower] ||
    (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(wordClean));

  return {
    word_en: wordClean,
    word_th: rawMeaning,
    reading_th: validReading,
    part_of_speech: normalizePartOfSpeech(parsed.part_of_speech),
    example_sentence_en: parsed.example_sentence_en || '',
    example_sentence_th: parsed.example_sentence_th || '',
  };
};

/**
 * Batch generates bilingual vocabulary details for multiple English words in a single Gemini call
 */
export const batchGenerateVocabWithGemini = async (
  words: string[]
): Promise<TranslationResponse[]> => {
  const uniqueWords = Array.from(new Set(words.map((w) => w.trim()))).filter(Boolean);
  if (uniqueWords.length === 0) return [];

  console.log(`[Gemini] Batch generating vocabulary for ${uniqueWords.length} words...`);

  // If batch is large (> 25), chunk into smaller batches of 20
  if (uniqueWords.length > 25) {
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueWords.length; i += 20) {
      chunks.push(uniqueWords.slice(i, i + 20));
    }
    const chunkResults = await Promise.all(
      chunks.map((chunk) => batchGenerateVocabWithGemini(chunk))
    );
    return chunkResults.flat();
  }

  const systemPrompt = `You are a world-class English-Thai educational linguist, dictionary editor, and phonetic specialist for Thai schools.

For EVERY given English word, provide accurate educational details with STRICT separation between Thai Meaning (word_th) and Thai Phonetic Reading (reading_th):
- "word_en": The English word.
- "word_th": Natural Thai MEANING / TRANSLATION ONLY. (Never phonetic transliteration here).
- "reading_th": Standard Thai PHONETIC PRONUNCIATION guide (e.g. "method" -> "เมธอด", "chicken" -> "ชิกเก้น", "nest" -> "เนสต์", "world" -> "เวิลด์"). (Never Thai meaning here).
- "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
- "example_sentence_en": Clear simple educational English example sentence.
- "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON:
{
  "items": [
    {
      "word_en": "word",
      "word_th": "ความหมายภาษาไทย",
      "reading_th": "คำอ่านออกเสียงภาษาไทย",
      "part_of_speech": "noun",
      "example_sentence_en": "English example",
      "example_sentence_th": "คำแปลประโยคภาษาไทย"
    }
  ]
}`;

  const userPrompt = `Please generate educational bilingual vocabulary entries for the following English words:
${JSON.stringify(uniqueWords)}`;

  const text = await callGeminiApi({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const parsed = cleanAndParseJson(text);
  const rawItems = Array.isArray(parsed.items)
    ? parsed.items
    : Array.isArray(parsed)
    ? parsed
    : [];

  const resultMap = new Map<string, TranslationResponse>();

  for (const item of rawItems) {
    if (!item || !item.word_en) continue;
    const cleanEn = String(item.word_en).trim();
    const lowerEn = cleanEn.toLowerCase();
    const rawReading = String(item.reading_th || '').trim();
    const rawMeaning = String(item.word_th || cleanEn).trim();
    const validReading =
      COMMON_PHONETICS[lowerEn] ||
      (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(cleanEn));

    resultMap.set(lowerEn, {
      word_en: cleanEn,
      word_th: rawMeaning,
      reading_th: validReading,
      part_of_speech: normalizePartOfSpeech(item.part_of_speech),
      example_sentence_en: item.example_sentence_en || '',
      example_sentence_th: item.example_sentence_th || '',
    });
  }

  // Preserve original ordering and fill any missing items
  return uniqueWords.map((originalWord) => {
    const found = resultMap.get(originalWord.toLowerCase());
    if (found) return found;
    return {
      word_en: originalWord,
      word_th: originalWord,
      reading_th: COMMON_PHONETICS[originalWord.toLowerCase()] || getThaiPhonetic(originalWord),
      part_of_speech: 'noun',
      example_sentence_en: `We learn the word "${originalWord}".`,
      example_sentence_th: `เรากำลังเรียนรู้คำว่า "${originalWord}".`,
    };
  });
};

/**
 * Extracts vocabulary words & sheet title from an image using Gemini Multimodal Vision
 * Extracts clean vocabulary words, detects title, and provides complete bilingual entries
 */
export const extractVocabListWithGeminiVision = async (
  base64Image: string,
  mimeType = 'image/jpeg'
): Promise<ExtractedVocabSheet> => {
  console.log('[Gemini Vision] Extracting vocabulary from image via Google AI Studio...');

  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  const systemPrompt = `You are a world-class educational AI vision and linguist assistant specializing in English-Thai vocabulary learning for Thai schools.

Your task:
1. Carefully inspect the image (it could be a worksheet, textbook page, spelling list, flashcard, handwritten notes, bilingual table, or photos of objects/scenes).
2. Extract all TARGET English vocabulary words/phrases found in or represented by the image in correct sequential reading order.
   - Ignore noise, index numbers (1, 2, 3...), dates, instructions, and headers.
   - Preserve clean words without trailing symbols or punctuation.
3. For EVERY extracted word, generate complete educational details:
   - "word_en": The English word (clean, standard casing).
   - "word_th": Accurate, natural Thai MEANING / TRANSLATION ONLY (ความหมาย/คำแปลภาษาไทย). MUST be in the Thai script (ภาษาไทย).
   - "reading_th": Standard Thai PHONETIC PRONUNCIATION guide (คำอ่านออกเสียงของคำภาษาอังกฤษเป็นอักษรไทย เช่น "method" -> "เมธอด", "chicken" -> "ชิกเก้น"). (CRITICAL: NEVER put the Thai meaning here).
   - "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
   - "example_sentence_en": Clear simple educational example sentence.
   - "example_sentence_th": Natural Thai translation of the example sentence.
4. Detect any worksheet title or topic if visible (e.g. "Spelling Unit 3", "Science Vocabulary").

Respond ONLY with valid JSON matching this schema:
{
  "title": "Detected Title or empty string",
  "words": [
    {
      "word_en": "word",
      "word_th": "ความหมายภาษาไทย",
      "reading_th": "คำอ่านภาษาไทย",
      "part_of_speech": "noun",
      "example_sentence_en": "...",
      "example_sentence_th": "..."
    }
  ]
}`;

  const userPrompt =
    'Please analyze this worksheet/image, extract all English vocabulary words in sequential order, and provide complete bilingual details (Thai meaning, Thai pronunciation, and example sentences) in JSON format.';

  const text = await callGeminiApi({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: userPrompt },
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const parsed = cleanAndParseJson(text);
  const title = parsed.title ? String(parsed.title).trim() : undefined;
  const rawList = Array.isArray(parsed.words)
    ? parsed.words
    : Array.isArray(parsed.items)
    ? parsed.items
    : [];

  const wordStrings: string[] = [];
  const entries: TranslationResponse[] = [];

  for (const item of rawList) {
    if (typeof item === 'string') {
      const clean = item.trim();
      if (clean) {
        wordStrings.push(clean);
        entries.push({
          word_en: clean,
          word_th: clean,
          reading_th: COMMON_PHONETICS[clean.toLowerCase()] || getThaiPhonetic(clean),
          part_of_speech: 'noun',
          example_sentence_en: '',
          example_sentence_th: '',
        });
      }
    } else if (item && typeof item === 'object' && item.word_en) {
      const cleanEn = String(item.word_en).trim();
      if (!cleanEn) continue;
      const lowerEn = cleanEn.toLowerCase();
      const rawReading = String(item.reading_th || '').trim();
      const rawMeaning = String(item.word_th || cleanEn).trim();
      const validReading =
        COMMON_PHONETICS[lowerEn] ||
        (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(cleanEn));

      wordStrings.push(cleanEn);
      entries.push({
        word_en: cleanEn,
        word_th: rawMeaning,
        reading_th: validReading,
        part_of_speech: normalizePartOfSpeech(item.part_of_speech),
        example_sentence_en: item.example_sentence_en || '',
        example_sentence_th: item.example_sentence_th || '',
      });
    }
  }

  return {
    title,
    words: wordStrings,
    entries: entries.length > 0 ? entries : undefined,
  };
};

/**
 * Generates structured vocabulary items from an educational topic/prompt using Google AI Studio (Gemini)
 * Strictly constrained to educational vocabulary list output (no conversational responses, max 50 items)
 */
export const generateVocabFromPromptWithGemini = async (
  userPrompt: string,
  count: number = 10,
  existingWords: string[] = []
): Promise<TranslationResponse[]> => {
  const cleanPrompt = userPrompt.trim();
  if (!cleanPrompt) {
    throw new Error('Please provide a prompt or topic for vocabulary generation');
  }

  const targetCount = Math.min(Math.max(Number(count) || 10, 1), 50);

  const existingWordList = existingWords
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 100);

  console.log(`[Gemini] Generating ${targetCount} vocabulary words for prompt: "${cleanPrompt}"`);

  const systemPrompt = `You are a world-class English-Thai educational curriculum developer, lexicographer, and phonetic specialist.

YOUR SOLE MISSION:
Generate exactly ${targetCount} high-quality, relevant English vocabulary words based on the user's educational topic or description.

CRITICAL GUARDRAILS & SCOPE LIMITATION:
1. STRICT VOCABULARY GENERATION ONLY: You must ONLY generate a list of English vocabulary words with their Thai translations.
2. ZERO OFF-TOPIC CONVERSATION: Do NOT answer questions, do NOT chat, do NOT write essays, code, stories, or summaries. If the user prompt is conversational or off-topic, interpret it STRICTLY as a thematic keyword to find educational English words related to that theme.
3. DUPLICATE PREVENTION: ${
    existingWordList.length > 0
      ? `DO NOT include any of the following existing words: [${existingWordList.join(', ')}].`
      : 'Do not repeat words within the list.'
  }
4. STRICT COUNT: Provide exactly ${targetCount} distinct, useful vocabulary words appropriate for learners.

STRICT BILINGUAL & PHONETIC SCHEMA RULES:
- "word_en": The English vocabulary word or standard collocation (lowercase/standard case).
- "word_th": Accurate, natural Thai MEANING / TRANSLATION ONLY. (NO phonetic transliteration here).
- "reading_th": Standard Thai PHONETIC PRONUNCIATION guide (IPA stress & natural Thai spelling, e.g. "january" -> "แจนยัวรี่", "march" -> "มาร์ช", "august" -> "ออกัสต์", "bat" -> "แบท", "girl" -> "เกิร์ล", "chicken" -> "ชิกเก้น", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์"). (CRITICAL: NEVER put Thai meaning like "เดือนมกราคม" in reading_th).
- "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
- "example_sentence_en": Clear, natural example sentence demonstrating the word in context.
- "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON:
{
  "items": [
    {
      "word_en": "string",
      "word_th": "string",
      "reading_th": "string",
      "part_of_speech": "noun | verb | adj | adv | gerund | past_participle | other",
      "example_sentence_en": "string",
      "example_sentence_th": "string"
    }
  ]
}`;

  const promptText = `Topic/Prompt: "${cleanPrompt}". Please generate ${targetCount} distinct English vocabulary items.`;

  const text = await callGeminiApi({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const parsed = cleanAndParseJson(text);
  const rawItems = Array.isArray(parsed.items)
    ? parsed.items
    : Array.isArray(parsed)
    ? parsed
    : [];

  if (rawItems.length === 0) {
    throw new Error('No vocabulary items were generated by Gemini.');
  }

  const seen = new Set<string>(existingWordList);
  const results: TranslationResponse[] = [];

  for (const item of rawItems) {
    if (!item || !item.word_en) continue;
    const cleanEn = String(item.word_en).trim();
    const lowerEn = cleanEn.toLowerCase();

    if (seen.has(lowerEn)) continue;
    seen.add(lowerEn);

    const rawReading = String(item.reading_th || '').trim();
    const rawMeaning = String(item.word_th || cleanEn).trim();
    const validReading =
      COMMON_PHONETICS[lowerEn] ||
      (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(cleanEn));

    results.push({
      word_en: cleanEn,
      word_th: rawMeaning,
      reading_th: validReading,
      part_of_speech: normalizePartOfSpeech(item.part_of_speech),
      example_sentence_en: item.example_sentence_en || '',
      example_sentence_th: item.example_sentence_th || '',
    });

    if (results.length >= targetCount) break;
  }

  return results;
};
