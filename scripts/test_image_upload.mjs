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

// 1x1 transparent png
const testPngBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const body = {
  messages: [
    { role: 'system', content: 'You extract vocabulary from images.' },
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Analyze this image and return JSON: {"words":[]}' },
        { type: 'image_url', image_url: { url: testPngBase64, detail: 'high' } },
      ],
    },
  ],
  response_format: { type: 'json_object' },
  temperature: 0.1,
  max_tokens: 1000,
};

console.log('Sending request to:', url);
const res = await fetch(url, {
  method: 'POST',
  headers: { 'api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

console.log('Status:', res.status, res.statusText);
const text = await res.text();
console.log('Response:', text);
