import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const m = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let value = m[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[m[1]] = value;
  }
});

const key = env.VITE_AZURE_OPENAI_KEY;
const endpoint = env.VITE_AZURE_OPENAI_ENDPOINT;
const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
const apiVersion = '2024-08-01-preview';
const u = new URL(endpoint);
const url = `${u.protocol}//${u.host}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

const imgBuffer = fs.readFileSync('ui_design/set_detail_word_buddy/screen.png');
const base64 = imgBuffer.toString('base64');
const imageUrl = `data:image/png;base64,${base64}`;

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

console.log('Sending request with real image (size:', (imgBuffer.length / 1024).toFixed(1), 'KB)...');
const startTime = Date.now();

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

  console.log('Status:', res.status, res.statusText, 'Elapsed:', Date.now() - startTime, 'ms');
  const text = await res.text();
  console.log('Response length:', text.length);
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content;
  console.log('Choices message content:\n', content ? content.slice(0, 500) + '...' : 'NONE');
} catch (err) {
  console.error('Error:', err);
}
