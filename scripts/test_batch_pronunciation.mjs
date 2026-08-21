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

const words = [
  "quadrilateral",
  "parallelogram",
  "rhombus",
  "kite",
  "trapezium",
  "diagonal",
  "perimeter",
  "area",
  "innovation",
  "project",
  "urban",
  "design",
  "arcology",
  "nest",
  "hen",
  "chicken",
  "seeds",
  "chick",
  "hatch",
  "heaviest"
];

async function testBatch() {
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

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ words }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log('Results:');
  parsed.items.forEach((item, idx) => {
    console.log(`${idx+1}. ${item.word_en} | reading_th: ${item.reading_th} | meaning: ${item.word_th}`);
  });
}

testBatch();
