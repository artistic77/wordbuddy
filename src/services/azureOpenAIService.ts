// ==============================================================================
// Microsoft Azure OpenAI Service (gpt-4o-mini)
// Generates accurate Thai Pronunciation (คำอ่านภาษาไทย), meanings, and example sentences
// ==============================================================================

import type { TranslationResponse, PartOfSpeech } from '../types';

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

Your mission is to generate 100% accurate, natural, and standard Thai phonetic pronunciation guides ("reading_th") following authentic English phonetics (IPA) and standard Thai transliteration conventions used in educational dictionaries.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "perimeter" -> "เพอริมิเทอร์" or "เพอริมมิเตอร์" (NOT "พีริมิเทอร์")
   - "quadrilateral" -> "ควอดริแลเทอรอล" or "ควอดริแลทเทอรัล"
   - "parallelogram" -> "แพแรลเลโลแกรม"
   - "trapezium" -> "ทราพีเซียม" or "ทระพีเซียม"
   - "diagonal" -> "ไดแอกกะนอล" or "ไดแอกโกนอล"
   - "heaviest" -> "เฮฟวิเอสต์" or "เฮฟวี่เอสต์"
   - "rhombus" -> "รอมบัส"
   - "project" -> "โพรเจ็คท์"
   - "seeds" -> "ซีดส์"
   - "nest" -> "เนสต์"
   - "hatch" -> "แฮทช์"
   - "chick" -> "ชิค"
   - "hen" -> "เฮน"
   - "urban" -> "เออร์บัน"
   - "arcology" -> "อาร์โคโลจี"
   - "method" -> "เมธอด"
   - "schedule" -> "สเกดจูล"
   - "pattern" -> "แพทเทิร์น"

2. Use correct Thai vowel and consonant symbols:
   - Final /st/ -> "สต์" (e.g. nest -> เนสต์, heaviest -> เฮฟวิเอสต์)
   - Final /tʃ/ -> "ทช์" or "ช์" (e.g. hatch -> แฮทช์, watch -> วอทช์)
   - Final /d/ or /dz/ -> "ด" or "ดส์" (e.g. seeds -> ซีดส์)
   - Ending -en / -in -> "เก้น" / "เซ่น" / "เท่น" (e.g. chicken -> ชิกเก้น, kitten -> คิทเท่น)
   - Weak syllables with /ə/ or /ɪ/ -> use natural Thai vowel representations ("เออ", "อะ", "อิ" depending on English stress).

3. NEVER output translation as reading (e.g. for "method" never output "วิธี", output "เมธอด").

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
  return {
    word_en: parsed.word_en || cleanWord,
    word_th: parsed.word_th || cleanWord,
    reading_th: parsed.reading_th || '',
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

Your mission is to generate 100% accurate, natural, and standard Thai phonetic pronunciation guides ("reading_th") following authentic English phonetics (IPA) and standard Thai transliteration conventions used in educational dictionaries.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "perimeter" -> "เพอริมิเทอร์" or "เพอริมมิเตอร์" (NOT "พีริมิเทอร์")
   - "quadrilateral" -> "ควอดริแลเทอรอล" or "ควอดริแลทเทอรัล"
   - "parallelogram" -> "แพแรลเลโลแกรม"
   - "trapezium" -> "ทราพีเซียม" or "ทระพีเซียม"
   - "diagonal" -> "ไดแอกกะนอล" or "ไดแอกโกนอล"
   - "heaviest" -> "เฮฟวิเอสต์" or "เฮฟวี่เอสต์"
   - "rhombus" -> "รอมบัส"
   - "project" -> "โพรเจ็คท์"
   - "seeds" -> "ซีดส์"
   - "nest" -> "เนสต์"
   - "hatch" -> "แฮทช์"
   - "chick" -> "ชิค"
   - "hen" -> "เฮน"
   - "urban" -> "เออร์บัน"
   - "arcology" -> "อาร์โคโลจี"

2. Use correct Thai vowel and consonant symbols:
   - Final /st/ -> "สต์" (e.g. nest -> เนสต์, heaviest -> เฮฟวิเอสต์)
   - Final /tʃ/ -> "ทช์" or "ช์" (e.g. hatch -> แฮทช์, watch -> วอทช์)
   - Final /d/ or /dz/ -> "ด" or "ดส์" (e.g. seeds -> ซีดส์)
   - Ending -en / -in -> "เก้น" / "เซ่น" / "เท่น" (e.g. chicken -> ชิกเก้น)
   - Weak syllables with /ə/ or /ɪ/ -> use natural Thai vowel representations ("เออ", "อะ", "อิ" depending on English stress).

3. NEVER output translation as reading (e.g. for "method" never output "วิธี", output "เมธอด").

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
          return parsed.items as TranslationResponse[];
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
}

/**
 * Extracts vocabulary words & sheet title from an image using Azure OpenAI Vision (gpt-4.1-mini)
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

  const systemPrompt = `You are an expert AI vision assistant specializing in analyzing educational English worksheets, spelling word lists, textbooks, flashcards, and student study sheets.

Your task:
1. Identify and extract all TARGET English vocabulary words from the image.
2. Ignore noise, row numbers, indices (e.g. 1, 2, 3, 4, 11, 12...), page numbers, dates (e.g. "Date: 20/8/26", "Spelling Test Day: 3/9/26"), instructions, and column headers.
3. Preserve correct sequential reading order (e.g., if there are multiple columns numbered 1 to 10 on the left and 11 to 20 on the right, return them in order 1, 2, 3, ... 20).
4. Identify any worksheet or list title/topic if visible (e.g., "Spelling Word List (6)", "Science Unit 3", etc.).
5. Ensure words are clean, lower-cased/standard-cased without leading/trailing numbers or punctuation.

Respond ONLY with valid JSON matching this schema:
{
  "title": "Detected Title or empty string",
  "words": ["word1", "word2", "word3", ...]
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
              text: 'Please carefully analyze this image, understand its layout (such as tables or numbered columns), and extract all the vocabulary words and the list title in JSON format.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
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
  const words: string[] = Array.isArray(parsed.words)
    ? parsed.words.map((w: any) => String(w).trim()).filter(Boolean)
    : [];

  return {
    title: parsed.title ? String(parsed.title).trim() : undefined,
    words,
  };
};

