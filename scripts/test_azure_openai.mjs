import fs from 'fs';
import path from 'path';

// Read .env file manually
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

console.log('Testing Microsoft Azure OpenAI (gpt-4.1-mini) for Word Buddy...');
console.log('Endpoint URL:', url);
console.log('Key prefix:', key ? key.substring(0, 10) + '...' : 'NONE');

async function testAzureOpenAI() {
  const testWord = 'serendipity';
  const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
For any given English vocabulary word or phrase, generate:
1. "word_en": The English word formatted properly.
2. "word_th": Natural and accurate Thai meaning / translation.
3. "reading_th": The PHONETIC PRONUNCIATION of the ENGLISH WORD in Thai script (คำอ่านออกเสียงของคำภาษาอังกฤษคำนั้นเป็นอักษรไทย เช่น "method" -> "เมธอด", "bat" -> "แบท", "topology" -> "โทโพโลยี").
4. "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
5. "example_sentence_en": Clear educational English example sentence.
6. "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON matching this schema:
{
  "word_en": "string",
  "word_th": "string",
  "reading_th": "string",
  "part_of_speech": "noun",
  "example_sentence_en": "string",
  "example_sentence_th": "string"
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
          { role: 'user', content: `English word: "${testWord}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`❌ OpenAI call failed (${res.status}):`, err);
      return;
    }

    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content);
    console.log('\n✨ Result from Azure OpenAI (gpt-4.1-mini):');
    console.log('   - Word (EN):', result.word_en);
    console.log('   - Meaning (TH):', result.word_th);
    console.log('   - Thai Pronunciation (Reading TH):', result.reading_th);
    console.log('   - Part of Speech:', result.part_of_speech);
    console.log('   - Example (EN):', result.example_sentence_en);
    console.log('   - Example (TH):', result.example_sentence_th);
    console.log('\n🎉 Azure OpenAI (gpt-4.1-mini) is 100% READY & WORKING!');
  } catch (e) {
    console.error('Error during test:', e);
  }
}

testAzureOpenAI();
