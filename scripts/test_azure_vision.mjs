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

// 1x1 transparent PNG base64
const sample1x1Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAEASTN7AAAAABJRU5ErkJggg==';

async function testAzureVision() {
  console.log('Testing Azure OpenAI Vision support on:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an intelligent vision assistant for educational vocabulary worksheets. Extract words.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'What do you see in this image? Respond with a short JSON { "detected": true }',
              },
              {
                type: 'image_url',
                image_url: {
                  url: sample1x1Png,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    console.log('HTTP Status:', res.status);
    const body = await res.text();
    console.log('Response body:', body);
  } catch (err) {
    console.error('Vision test error:', err);
  }
}

testAzureVision();
