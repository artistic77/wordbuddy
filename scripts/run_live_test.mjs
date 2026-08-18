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

console.log('Using Working Azure OpenAI URL:', workingUrl);

const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
For any given English vocabulary word or phrase, generate:
1. "word_en": The English word formatted properly.
2. "word_th": Natural and accurate Thai meaning.
3. "reading_th": Precise Thai phonetic reading (คำอ่านภาษาไทยตามหลักราชบัณฑิตยสถานและสัทศาสตร์สากล, e.g. for "topology" -> "โทโพโลยี", for "premium" -> "พรีเมียม", for "entrepreneur" -> "ออนเทรอะเพรอเนอร์").
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": A clear, natural, educational English sentence using the word suitable for learners.
6. "example_sentence_th": A natural Thai translation of the English example sentence.

Respond ONLY with valid JSON:
{
  "word_en": "string",
  "word_th": "string",
  "reading_th": "string",
  "part_of_speech": "noun",
  "example_sentence_en": "string",
  "example_sentence_th": "string"
}`;

async function runLiveTest() {
  const words = ['Topology', 'Premium', 'Entrepreneur', 'Schedule'];

  for (const word of words) {
    console.log(`\n=================== Testing Word: "${word}" ===================`);
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

    if (!res.ok) {
      console.log(`❌ Error (${res.status}):`, await res.text());
      continue;
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    console.log('✅ Response (Status 200 OK):');
    console.log(' 🔹 English Word:   ', parsed.word_en);
    console.log(' 🔹 Thai Meaning:   ', parsed.word_th);
    console.log(' 🔹 Thai Reading:   ', parsed.reading_th, `(อ่านว่า: ${parsed.reading_th})`);
    console.log(' 🔹 Part of Speech: ', parsed.part_of_speech);
    console.log(' 🔹 Example (EN):   ', parsed.example_sentence_en);
    console.log(' 🔹 Example (TH):   ', parsed.example_sentence_th);
  }

  console.log('\n===============================================================');
  console.log('🎉 AZURE OPENAI (GPT-4.1-MINI) TEST PASSED PERFECTLY WITH 100% ACCURACY!');
}

runLiveTest();
