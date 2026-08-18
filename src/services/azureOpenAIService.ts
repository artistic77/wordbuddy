// ==============================================================================
// Microsoft Azure OpenAI Service (gpt-4o-mini)
// Generates accurate Thai Pronunciation (คำอ่านภาษาไทย), meanings, and example sentences
// ==============================================================================

import type { TranslationResponse, PartOfSpeech } from '../types';

export const isAzureOpenAIConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_AZURE_OPENAI_KEY &&
    import.meta.env.VITE_AZURE_OPENAI_ENDPOINT
  );
};

const getAzureOpenAIUrl = (): string => {
  const rawEndpoint = (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '').trim();
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
  const key = import.meta.env.VITE_AZURE_OPENAI_KEY;
  if (!key) {
    throw new Error('Azure OpenAI key is not configured');
  }

  const cleanWord = word.trim();
  const url = getAzureOpenAIUrl();

  const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
For any given English vocabulary word or phrase, generate:
1. "word_en": The English word formatted properly.
2. "word_th": Natural and accurate Thai meaning / translation (e.g. for "method" -> "วิธีการ", for "bat" -> "ค้างคาว").
3. "reading_th": The PHONETIC PRONUNCIATION of the ENGLISH WORD written in THAI SCRIPT (คำอ่านออกเสียงของคำภาษาอังกฤษคำนั้นด้วยตัวอักษรไทย ห้ามใส่คำอ่านของคำแปลภาษาไทยเด็ดขาด! ตัวอย่างเช่น: "method" -> "เมธอด" ไม่ใช่ "วิ-ที-การ", "pattern" -> "แพทเทิร์น", "reading" -> "รีดดิ้ง", "bat" -> "แบท", "topology" -> "โทโพโลยี", "premium" -> "พรีเมียม", "schedule" -> "สเกดจูล").
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": A clear, natural, educational English sentence using the word suitable for learners.
6. "example_sentence_th": A natural Thai translation of the English example sentence.

Respond ONLY with valid JSON matching this schema:
{
  "word_en": "string",
  "word_th": "string",
  "reading_th": "string",
  "part_of_speech": "noun",
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
  const key = import.meta.env.VITE_AZURE_OPENAI_KEY;
  if (!key || words.length === 0) return [];

  const uniqueWords = Array.from(new Set(words.map((w) => w.trim()))).filter(Boolean);
  const url = getAzureOpenAIUrl();

  const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
For each given English word in the input list, return a JSON array containing objects with:
- "word_en": English word
- "word_th": Natural Thai meaning
- "reading_th": The PHONETIC PRONUNCIATION of the ENGLISH WORD in Thai script (คำอ่านออกเสียงของคำภาษาอังกฤษคำนั้นเป็นอักษรไทย เช่น "method" -> "เมธอด", "bat" -> "แบท", "topology" -> "โทโพโลยี")
- "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"]
- "example_sentence_en": Clear educational English example sentence
- "example_sentence_th": Natural Thai translation of the example sentence

Respond ONLY with valid JSON:
{
  "items": [
    {
      "word_en": "...",
      "word_th": "...",
      "reading_th": "...",
      "part_of_speech": "noun",
      "example_sentence_en": "...",
      "example_sentence_th": "..."
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
