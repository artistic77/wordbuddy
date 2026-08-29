import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[match[1]] = value;
  }
});

const key = env.VITE_AZURE_OPENAI_KEY;
const endpoint = env.VITE_AZURE_OPENAI_ENDPOINT || '';
const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
const apiVersion = '2024-08-01-preview';

let baseHost = endpoint;
try {
  const u = new URL(endpoint);
  baseHost = `${u.protocol}//${u.host}`;
} catch {
  baseHost = endpoint.replace(/\/+$/, '');
}

const url = `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

async function testUnifiedVision() {
  console.log('Testing Unified 1-Shot Vision & Translation prompt...');

  const systemPrompt = `You are a world-class educational AI vision and linguist assistant specializing in English-Thai vocabulary learning.

Your task:
1. Carefully inspect the image (it could be a worksheet, textbook page, spelling list, flashcard, handwritten notes, bilingual table, or photos of objects/scenes).
2. Extract all English vocabulary words/phrases found in or represented by the image in correct sequential reading order.
3. For EVERY extracted word, generate complete educational details:
   - "word_en": The English word (clean, standard casing).
   - "word_th": Accurate Thai MEANING/TRANSLATION (ความหมายภาษาไทย เช่น "method" -> "วิธีการ / วิธี", "resilience" -> "ความยืดหยุ่น / การฟื้นตัว").
   - "reading_th": Standard Thai PHONETIC PRONUNCIATION (คำอ่านออกเสียง เช่น "method" -> "เมธอด", "resilience" -> "เรซิลิเอนซ์").
   - "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
   - "example_sentence_en": Simple example sentence.
   - "example_sentence_th": Thai translation of example sentence.
4. Detect any worksheet title or topic if visible (e.g. "Spelling Unit 3", "Science Vocabulary").

Respond ONLY with valid JSON matching this schema:
{
  "title": "Worksheet Title or empty string",
  "words": [
    {
      "word_en": "example",
      "word_th": "ตัวอย่าง",
      "reading_th": "เอ็กแซมเปิล",
      "part_of_speech": "noun",
      "example_sentence_en": "This is a good example.",
      "example_sentence_th": "นี่เป็นตัวอย่างที่ดี"
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
              text: 'Please analyze this worksheet and return all words with full Thai translations and phonetics in JSON format.',
            },
            {
              type: 'text',
              text: 'Sample Content: 1. dinosaur 2. volcano 3. fossil 4. ecosystem',
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  const data = await res.json();
  console.log('Result choice:', data.choices[0].message.content);
}

testUnifiedVision();
