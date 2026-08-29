// ==============================================================================
// Microsoft Azure OpenAI Service (gpt-4o-mini)
// Generates accurate Thai Pronunciation (คำอ่านภาษาไทย), meanings, and example sentences
// ==============================================================================

import type { TranslationResponse, PartOfSpeech } from '../types';
import { COMMON_PHONETICS, getThaiPhonetic } from './phoneticService';

const DEFAULT_AZURE_OPENAI_ENDPOINT = 'https://artistic77-1198-resource.services.ai.azure.com';
const DEFAULT_AZURE_OPENAI_KEY_B64 = 'VGpJamZmcElPRG5xSEp5ZkV1QlBvQVdIYUdQZk44ZlZoV2lZV2JZamxCNXhIZ1F1QTlaWkpRUUo5OUNIQUNNc2ZyRlhKM3czQUFBQUFDT0dFWHBH';

export const getAzureOpenAIKey = (): string => {
  const envKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
  if (envKey && envKey !== 'undefined' && envKey !== 'null' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  try {
    return atob(DEFAULT_AZURE_OPENAI_KEY_B64);
  } catch {
    return '';
  }
};

export const getAzureOpenAIEndpoint = (): string => {
  const envEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  if (envEndpoint && envEndpoint !== 'undefined' && envEndpoint.startsWith('http')) {
    return envEndpoint.trim();
  }
  return DEFAULT_AZURE_OPENAI_ENDPOINT;
};

export const isAzureOpenAIConfigured = (): boolean => {
  return Boolean(getAzureOpenAIKey() && getAzureOpenAIEndpoint());
};

const getAzureOpenAIUrl = (): string => {
  const rawEndpoint = getAzureOpenAIEndpoint();
  let baseHost = rawEndpoint;
  try {
    const u = new URL(rawEndpoint);
    baseHost = `${u.protocol}//${u.host}`;
  } catch {
    baseHost = rawEndpoint.replace(/\/+$/, '');
  }

  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
  // Use supported chat completions preview version
  const apiVersion =
    import.meta.env.VITE_AZURE_OPENAI_API_VERSION && import.meta.env.VITE_AZURE_OPENAI_API_VERSION !== '2025-04-14'
      ? import.meta.env.VITE_AZURE_OPENAI_API_VERSION
      : '2024-08-01-preview';

  return `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
};

/**
 * Generates rich bilingual vocabulary details using Azure OpenAI (gpt-4o-mini)
 */
export const generateVocabWithAzureOpenAI = async (word: string): Promise<TranslationResponse> => {
  const key = getAzureOpenAIKey();
  if (!key) {
    throw new Error('Azure OpenAI key is not configured');
  }

  const cleanWord = word.trim();
  const url = getAzureOpenAIUrl();
  console.log(`[Azure OpenAI] Requesting gpt-4.1-mini for word: "${cleanWord}" -> ${url}`);

  const systemPrompt = `You are a world-class English-Thai educational linguist, dictionary editor, and phonetic specialist for Thai schools.

For any given English vocabulary word or phrase, you MUST provide accurate bilingual details with STRICT separation between Thai Meaning (word_th) and Thai Phonetic Reading (reading_th):

1. "word_en": The English word properly formatted.
2. "word_th": The accurate, natural Thai MEANING / TRANSLATION (ความหมาย/คำแปลภาษาไทย).
   - Examples of MEANING: "method" -> "วิธีการ / วิธี", "chicken" -> "ไก่ / เนื้อไก่", "bat" -> "ค้างคาว / ไม้เบสบอล", "nest" -> "รังนก", "diligent" -> "ขยันหมั่นเพียร", "serendipity" -> "โชคดีที่พบสิ่งดีโดยไม่คาดฝัน".
   - CRITICAL: NEVER put phonetic reading/transliteration in "word_th".
3. "reading_th": The standard Thai PHONETIC PRONUNCIATION guide (คำอ่านออกเสียงของคำภาษาอังกฤษเป็นอักษรไทย).
   - Examples of READING: "method" -> "เมธอด", "chicken" -> "ชิกเก้น", "bat" -> "แบท", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์", "serendipity" -> "เซเรนดิพิตี้".
   - CRITICAL: NEVER put the Thai meaning in "reading_th".
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": Clear educational English example sentence using the word.
6. "example_sentence_th": Natural Thai translation of the example sentence.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "january" -> "แจนยัวรี่" (Meaning: "เดือนมกราคม")
   - "february" -> "เฟบรัวรี่" (Meaning: "เดือนกุมภาพันธ์")
   - "march" -> "มาร์ช" (Meaning: "เดือนมีนาคม")
   - "april" -> "เอพริล" (Meaning: "เดือนเมษายน")
   - "may" -> "เมย์" (Meaning: "เดือนพฤษภาคม")
   - "june" -> "จูน" (Meaning: "เดือนมิถุนายน")
   - "july" -> "จูลาย" (Meaning: "เดือนกรกฎาคม")
   - "august" -> "ออกัสต์" (Meaning: "เดือนสิงหาคม")
   - "september" -> "เซปเทมเบอร์" (Meaning: "เดือนกันยายน")
   - "october" -> "อ็อกโทเบอร์" (Meaning: "เดือนตุลาคม")
   - "november" -> "โนเวมเบอร์" (Meaning: "เดือนพฤศจิกายน")
   - "december" -> "ดิเซมเบอร์" (Meaning: "เดือนธันวาคม")
   - "bat" -> "แบท"
   - "girl" -> "เกิร์ล"
   - "bird" -> "เบิร์ด"
   - "world" -> "เวิลด์"
   - "walk" -> "วอล์ค"
   - "water" -> "วอเทอร์"
   - "morning" -> "มอร์นิ่ง"
   - "afternoon" -> "อาฟเตอร์นูน"
   - "family" -> "แฟมิลี่"
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "perimeter" -> "เพอริมิเทอร์" or "เพอริมมิเตอร์" (NOT "พีริมิเทอร์")
   - "method" -> "เมธอด"
   - "schedule" -> "สเกดจูล"
   - "pattern" -> "แพทเทิร์น"

2. Use correct Thai vowel and consonant symbols:
   - R-controlled vowels: /ɜːr/ -> "เ...ิ...ร์..." (e.g. girl -> เกิร์ล, bird -> เบิร์ด, shirt -> เชิร์ต, nurse -> เนิร์ส, turn -> เทิร์น, world -> เวิลด์)
   - Final /st/ -> "สต์" (e.g. nest -> เนสต์, heaviest -> เฮฟวิเอสต์)
   - Final /tʃ/ -> "ทช์" or "ช์" (e.g. hatch -> แฮทช์, watch -> วอทช์)
   - Final /d/ or /dz/ -> "ด" or "ดส์" (e.g. seeds -> ซีดส์)
   - Ending -en / -in -> "เก้น" / "เซ่น" / "เท่น" (e.g. chicken -> ชิกเก้น, kitten -> คิทเท่น)
   - Weak syllables with /ə/ or /ɪ/ -> use natural Thai vowel representations ("เออ", "อะ", "อิ" depending on English stress).

Respond ONLY with valid JSON matching this schema:
{
  "word_en": "string",
  "word_th": "string",
  "reading_th": "string",
  "part_of_speech": "noun | verb | adj | adv | gerund | past_participle | other",
  "example_sentence_en": "string",
  "example_sentence_th": "string"
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `English word: "${cleanWord}"` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure OpenAI Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from Azure OpenAI');
  }

  const parsed = JSON.parse(content);
  const wordClean = parsed.word_en || cleanWord;
  const wordLower = wordClean.toLowerCase();
  const rawReading = String(parsed.reading_th || '').trim();
  const rawMeaning = String(parsed.word_th || cleanWord).trim();
  const validReading = COMMON_PHONETICS[wordLower] || (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(wordClean));

  return {
    word_en: wordClean,
    word_th: rawMeaning,
    reading_th: validReading,
    part_of_speech: (parsed.part_of_speech as PartOfSpeech) || 'noun',
    example_sentence_en: parsed.example_sentence_en || '',
    example_sentence_th: parsed.example_sentence_th || '',
  };
};

/**
 * Batch generates vocabulary details for multiple words using Azure OpenAI (gpt-4o-mini)
 */
export const batchGenerateVocabWithAzureOpenAI = async (words: string[]): Promise<TranslationResponse[]> => {
  const key = getAzureOpenAIKey();
  if (!key || words.length === 0) return [];

  const uniqueWords = Array.from(new Set(words.map((w) => w.trim()))).filter(Boolean);
  const url = getAzureOpenAIUrl();

  const systemPrompt = `You are a world-class English-Thai educational linguist, dictionary editor, and phonetic specialist for Thai schools.

For each given English vocabulary word or phrase, you MUST provide accurate bilingual details with STRICT separation between Thai Meaning (word_th) and Thai Phonetic Reading (reading_th):

1. "word_en": The English word properly formatted.
2. "word_th": The accurate, natural Thai MEANING / TRANSLATION (ความหมาย/คำแปลภาษาไทย).
   - Examples of MEANING: "method" -> "วิธีการ / วิธี", "chicken" -> "ไก่ / เนื้อไก่", "bat" -> "ค้างคาว / ไม้เบสบอล", "nest" -> "รังนก", "diligent" -> "ขยันหมั่นเพียร", "serendipity" -> "โชคดีที่พบสิ่งดีโดยไม่คาดฝัน".
   - CRITICAL: NEVER put phonetic reading/transliteration in "word_th".
3. "reading_th": The standard Thai PHONETIC PRONUNCIATION guide (คำอ่านออกเสียงของคำภาษาอังกฤษเป็นอักษรไทย).
   - Examples of READING: "method" -> "เมธอด", "chicken" -> "ชิกเก้น", "bat" -> "แบท", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์", "serendipity" -> "เซเรนดิพิตี้".
   - CRITICAL: NEVER put the Thai meaning in "reading_th".
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": Clear educational English example sentence using the word.
6. "example_sentence_th": Natural Thai translation of the example sentence.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "january" -> "แจนยัวรี่" (Meaning: "เดือนมกราคม")
   - "february" -> "เฟบรัวรี่" (Meaning: "เดือนกุมภาพันธ์")
   - "march" -> "มาร์ช" (Meaning: "เดือนมีนาคม")
   - "april" -> "เอพริล" (Meaning: "เดือนเมษายน")
   - "may" -> "เมย์" (Meaning: "เดือนพฤษภาคม")
   - "june" -> "จูน" (Meaning: "เดือนมิถุนายน")
   - "july" -> "จูลาย" (Meaning: "เดือนกรกฎาคม")
   - "august" -> "ออกัสต์" (Meaning: "เดือนสิงหาคม")
   - "september" -> "เซปเทมเบอร์" (Meaning: "เดือนกันยายน")
   - "october" -> "อ็อกโทเบอร์" (Meaning: "เดือนตุลาคม")
   - "november" -> "โนเวมเบอร์" (Meaning: "เดือนพฤศจิกายน")
   - "december" -> "ดิเซมเบอร์" (Meaning: "เดือนธันวาคม")
   - "bat" -> "แบท"
   - "girl" -> "เกิร์ล"
   - "bird" -> "เบิร์ด"
   - "world" -> "เวิลด์"
   - "walk" -> "วอล์ค"
   - "water" -> "วอเทอร์"
   - "morning" -> "มอร์นิ่ง"
   - "afternoon" -> "อาฟเตอร์นูน"
   - "family" -> "แฟมิลี่"
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "perimeter" -> "เพอริมิเทอร์" or "เพอริมมิเตอร์" (NOT "พีริมิเทอร์")
   - "method" -> "เมธอด"
   - "schedule" -> "สเกดจูล"
   - "pattern" -> "แพทเทิร์น"

2. Use correct Thai vowel and consonant symbols:
   - R-controlled vowels: /ɜːr/ -> "เ...ิ...ร์..." (e.g. girl -> เกิร์ล, bird -> เบิร์ด, shirt -> เชิร์ต, nurse -> เนิร์ส, turn -> เทิร์น, world -> เวิลด์)
   - Final /st/ -> "สต์" (e.g. nest -> เนสต์, heaviest -> เฮฟวิเอสต์)
   - Final /tʃ/ -> "ทช์" or "ช์" (e.g. hatch -> แฮทช์, watch -> วอทช์)
   - Final /d/ or /dz/ -> "ด" or "ดส์" (e.g. seeds -> ซีดส์)
   - Ending -en / -in -> "เก้น" / "เซ่น" / "เท่น" (e.g. chicken -> ชิกเก้น)
   - Weak syllables with /ə/ or /ɪ/ -> use natural Thai vowel representations ("เออ", "อะ", "อิ" depending on English stress).

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

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify({ words: uniqueWords }) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed.items.map((item: any) => {
            const wordClean = String(item.word_en || '').trim();
            const wordLower = wordClean.toLowerCase();
            const rawReading = String(item.reading_th || '').trim();
            const rawMeaning = String(item.word_th || wordClean).trim();
            const validReading = COMMON_PHONETICS[wordLower] || (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(wordClean));

            return {
              word_en: wordClean,
              word_th: rawMeaning,
              reading_th: validReading,
              part_of_speech: (item.part_of_speech as PartOfSpeech) || 'noun',
              example_sentence_en: String(item.example_sentence_en || '').trim(),
              example_sentence_th: String(item.example_sentence_th || '').trim(),
            };
          });
        }
      }
    }
  } catch (err) {
    console.warn('Azure OpenAI batch generation failed, falling back to concurrent requests:', err);
  }

  // Fallback: parallel single generation
  return Promise.all(uniqueWords.map((w) => generateVocabWithAzureOpenAI(w)));
};

export interface ExtractedVocabSheet {
  title?: string;
  words: string[];
  entries?: TranslationResponse[];
}

/**
 * Extracts vocabulary words & sheet title from an image using Azure OpenAI Vision (gpt-4.1-mini)
 * Supports 1-shot extraction with Thai meanings and pronunciations
 */
export const extractVocabListWithAzureVision = async (
  base64Image: string,
  mimeType = 'image/jpeg'
): Promise<ExtractedVocabSheet> => {
  const key = getAzureOpenAIKey();
  if (!key) {
    throw new Error('Azure OpenAI key is not configured');
  }

  const url = getAzureOpenAIUrl();
  console.log(`[Azure OpenAI Vision] Extracting vocabulary from image via ${url}...`);

  // Ensure valid data URL format
  let imageUrl = base64Image;
  if (!imageUrl.startsWith('data:')) {
    imageUrl = `data:${mimeType};base64,${base64Image}`;
  }

  const systemPrompt = `You are a world-class educational AI vision and linguist assistant specializing in English-Thai vocabulary learning.

Your task:
1. Carefully inspect the image (it could be a worksheet, textbook page, spelling list, flashcard, handwritten notes, bilingual table, or photos of objects/scenes).
2. Extract all English vocabulary words/phrases found in or represented by the image in correct sequential reading order.
3. For EVERY extracted word, generate complete educational details:
   - "word_en": The English word (clean, standard casing, e.g. "quadrilateral", "dinosaur", "reading").
   - "word_th": Accurate Thai MEANING/TRANSLATION (ความหมายภาษาไทย เช่น "method" -> "วิธีการ / วิธี", "resilience" -> "ความยืดหยุ่น").
   - "reading_th": Standard Thai PHONETIC PRONUNCIATION (คำอ่านออกเสียง เช่น "method" -> "เมธอด", "resilience" -> "เรซิลิเอนซ์").
   - "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
   - "example_sentence_en": Simple example sentence.
   - "example_sentence_th": Thai translation of example sentence.
4. Detect any worksheet title or topic if visible (e.g. "Spelling Unit 3", "Science Vocabulary").

Respond ONLY with valid JSON matching this schema:
{
  "title": "Detected Title or empty string",
  "words": [
    {
      "word_en": "word",
      "word_th": "ความหมาย",
      "reading_th": "คำอ่าน",
      "part_of_speech": "noun",
      "example_sentence_en": "...",
      "example_sentence_th": "..."
    }
  ]
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please carefully analyze this image, extract all vocabulary words/items, and provide Thai meanings and phonetic readings in JSON format.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure OpenAI Vision Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from Azure OpenAI Vision');
  }

  const parsed = JSON.parse(content);
  let rawList: any[] = [];
  if (Array.isArray(parsed.words)) {
    rawList = parsed.words;
  } else if (Array.isArray(parsed.items)) {
    rawList = parsed.items;
  } else if (Array.isArray(parsed.vocabulary)) {
    rawList = parsed.vocabulary;
  } else if (Array.isArray(parsed.entries)) {
    rawList = parsed.entries;
  } else if (Array.isArray(parsed)) {
    rawList = parsed;
  }

  const entries: TranslationResponse[] = [];
  const words: string[] = [];

  for (const item of rawList) {
    if (typeof item === 'string') {
      const clean = item.trim();
      if (clean && !clean.match(/^\d+$/)) {
        words.push(clean);
      }
    } else if (item && typeof item === 'object') {
      const en = String(item.word_en || item.word || item.english || '').trim();
      if (en && !en.match(/^\d+$/)) {
        words.push(en);
        const th = String(item.word_th || item.meaning || item.thai || `คำแปล: ${en}`).trim();
        const reading = String(item.reading_th || item.pronunciation || getThaiPhonetic(en)).trim();
        const pos = (item.part_of_speech || 'noun') as PartOfSpeech;
        const exEn = String(item.example_sentence_en || item.example_en || `Example using ${en}`).trim();
        const exTh = String(item.example_sentence_th || item.example_th || '').trim();
        entries.push({
          word_en: en,
          word_th: th,
          reading_th: reading,
          part_of_speech: pos,
          example_sentence_en: exEn,
          example_sentence_th: exTh,
        });
      }
    }
  }

  console.log(`[Azure OpenAI Vision] Extracted ${words.length} words (${entries.length} with full translations)`);

  return {
    title: parsed.title ? String(parsed.title).trim() : undefined,
    words,
    entries: entries.length > 0 ? entries : undefined,
  };
};

/**
 * Generates structured vocabulary items from a free-form educational topic/prompt using Azure OpenAI (gpt-4.1-mini)
 * Strictly constrained to educational vocabulary list output (no conversational responses, max 50 items)
 */
export const generateVocabFromPromptWithAzureOpenAI = async (
  userPrompt: string,
  count: number = 10,
  existingWords: string[] = []
): Promise<TranslationResponse[]> => {
  const key = getAzureOpenAIKey();
  if (!key) {
    throw new Error('Azure OpenAI key is not configured');
  }

  const cleanPrompt = userPrompt.trim();
  if (!cleanPrompt) {
    throw new Error('Please provide a prompt or topic for vocabulary generation');
  }

  // Strictly clamp requested count between 1 and 50
  const targetCount = Math.min(Math.max(Number(count) || 10, 1), 50);
  const url = getAzureOpenAIUrl();

  const existingWordList = existingWords
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 100);

  const systemPrompt = `You are a world-class English-Thai educational curriculum developer, lexicographer, and phonetic specialist.

YOUR SOLE MISSION:
Generate exactly ${targetCount} high-quality, relevant English vocabulary words based on the user's educational topic or description.

CRITICAL GUARDRAILS & SCOPE LIMITATION:
1. STRICT VOCABULARY GENERATION ONLY: You must ONLY generate a list of English vocabulary words with their Thai translations.
2. ZERO OFF-TOPIC CONVERSATION: Do NOT answer questions, do NOT chat, do NOT write essays, code, stories, or summaries. If the user prompt is conversational, off-topic, or asks for something other than vocabulary, interpret it STRICTLY as a thematic keyword to find educational English words related to that theme.
3. DUPLICATE PREVENTION: ${
    existingWordList.length > 0
      ? `DO NOT include any of the following existing words: [${existingWordList.join(', ')}].`
      : 'Do not repeat words within the list.'
  }
4. STRICT COUNT: Provide exactly ${targetCount} distinct, useful vocabulary words appropriate for learners.

STRICT BILINGUAL & PHONETIC SCHEMA RULES:
- "word_en": The English vocabulary word or standard collocation (lowercase/standard case).
- "word_th": Accurate, natural Thai MEANING / TRANSLATION ONLY. (NO phonetic transliteration here).
- "reading_th": Standard Thai PHONETIC PRONUNCIATION guide (IPA stress & natural Thai spelling, e.g. "january" -> "แจนยัวรี่", "march" -> "มาร์ช", "august" -> "ออกัสต์", "bat" -> "แบท", "girl" -> "เกิร์ล", "bird" -> "เบิร์ด", "world" -> "เวิลด์", "chicken" -> "ชิกเก้น", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์"). (CRITICAL: NEVER put Thai meaning like "เดือนมกราคม" in reading_th).
- "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
- "example_sentence_en": Clear, natural example sentence demonstrating the word in context.
- "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON matching this schema:
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

  console.log(`[Azure OpenAI] Generating ${targetCount} vocabs for prompt: "${cleanPrompt}"`);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Topic/Prompt: "${cleanPrompt}". Please generate ${targetCount} distinct English vocabulary items.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure OpenAI Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response received from Azure OpenAI');
  }

  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed.items) || parsed.items.length === 0) {
    throw new Error('No vocabulary items were generated by AI.');
  }

  // Deduplicate and filter against existing words
  const seen = new Set<string>(existingWordList);
  const results: TranslationResponse[] = [];

  for (const item of parsed.items) {
    const wordEn = String(item.word_en || '').trim();
    const wordLower = wordEn.toLowerCase();
    if (!wordEn || seen.has(wordLower)) continue;
    seen.add(wordLower);

    const rawReading = String(item.reading_th || '').trim();
    const rawMeaning = String(item.word_th || wordEn).trim();
    const validReading = COMMON_PHONETICS[wordLower] || (rawReading && rawReading !== rawMeaning ? rawReading : getThaiPhonetic(wordEn));

    results.push({
      word_en: wordEn,
      word_th: rawMeaning,
      reading_th: validReading,
      part_of_speech: (item.part_of_speech as PartOfSpeech) || 'noun',
      example_sentence_en: String(item.example_sentence_en || '').trim(),
      example_sentence_th: String(item.example_sentence_th || '').trim(),
    });

    if (results.length >= targetCount) break;
  }

  return results;
};


