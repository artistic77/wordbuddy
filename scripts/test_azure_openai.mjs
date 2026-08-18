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

let endpoint = (env.VITE_AZURE_OPENAI_ENDPOINT || '').trim();
const key = env.VITE_AZURE_OPENAI_KEY;
const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
const apiVersion = env.VITE_AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

console.log('Raw Endpoint:', endpoint);
console.log('Key prefix:', key ? key.substring(0, 10) + '...' : 'NONE');
console.log('Deployment:', deployment);
console.log('API Version:', apiVersion);

// Extract base host if user provided full path
let baseHost = endpoint;
try {
  const u = new URL(endpoint);
  baseHost = `${u.protocol}//${u.host}`;
} catch (e) {
  baseHost = endpoint.replace(/\/+$/, '');
}

const candidateUrls = [
  // If user provided exact URL (like /openai/v1/responses or /chat/completions)
  endpoint,
  // Azure AI Foundry / Azure OpenAI Deployments format
  `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
  `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`,
  `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
  // OpenAI v1 compatible format on Azure AI
  `${baseHost}/openai/v1/chat/completions`,
  `${baseHost}/models/chat/completions?api-version=2024-05-01-preview`,
  `${baseHost}/v1/chat/completions`,
];

const systemPrompt = `You are an expert English-Thai bilingual educational linguist.
Given an English word, return a JSON object with:
"word_en", "word_th", "reading_th", "part_of_speech", "example_sentence_en", "example_sentence_th".`;

async function testAll() {
  for (const url of candidateUrls) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Testing URL: ${url}`);
    try {
      const headers = {
        'api-key': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'English word: "Topology"' },
        ],
        model: deployment,
        response_format: { type: 'json_object' },
        temperature: 0.1,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      console.log(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Response snippet:`, text.substring(0, 300));

      if (res.ok) {
        console.log(`\n🎉 SUCCESSFUL URL: ${url}`);
        return { workingUrl: url, response: text };
      }
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
}

testAll();
