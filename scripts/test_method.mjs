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

const endpoint = env.VITE_AZURE_OPENAI_ENDPOINT || '';
const key = env.VITE_AZURE_OPENAI_KEY;
const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';

let baseHost = endpoint;
try {
  const u = new URL(endpoint);
  baseHost = `${u.protocol}//${u.host}`;
} catch (e) {
  baseHost = endpoint.replace(/\/+$/, '');
}

const workingUrl = `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
For any given English vocabulary word, generate:
1. "word_en": The English word.
2. "word_th": Natural Thai meaning / translation (e.g. for "method" -> "วิธีการ", for "bat" -> "ค้างคาว").
3. "reading_th": The PHONETIC PRONUNCIATION of the ENGLISH WORD written in THAI SCRIPT (คำอ่านออกเสียงของคำภาษาอังกฤษคำนั้นด้วยตัวอักษรไทย ห้ามใส่คำอ่านของคำแปลภาษาไทยเด็ดขาด! ตัวอย่าง: "method" -> "เมธอด", "reading" -> "รีดดิ้ง", "bat" -> "แบท", "topology" -> "โทโพโลยี", "computer" -> "คอมพิวเตอร์").
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": Clear educational English example sentence.
6. "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON.`;

async function testMethod() {
  const testWords = ['method', 'pattern', 'algorithm', 'function'];

  for (const word of testWords) {
    console.log(`\nTesting word: "${word}"`);
    const res = await fetch(workingUrl, {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `English word: "${word}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    const data = await res.json();
    const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    console.log(`Word:       ${content.word_en}`);
    console.log(`Meaning:    ${content.word_th}`);
    console.log(`Reading:    ${content.reading_th} (อ่านว่า: ${content.reading_th})`);
    console.log(`POS:        ${content.part_of_speech}`);
  }
}

testMethod();
