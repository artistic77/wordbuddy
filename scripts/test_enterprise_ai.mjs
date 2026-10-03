import fs from 'fs';
import path from 'path';

// Parse .env manually if exists
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch {}

const endpoint = process.env.VITE_AI_GATEWAY_ENDPOINT || 'https://ai-api-dev.dentsu.com';
const deployment = process.env.VITE_AI_GATEWAY_DEPLOYMENT || 'gpt-5.5';
const apiVersion = process.env.VITE_AI_GATEWAY_API_VERSION || '2024-10-21';
const key = process.env.VITE_AI_GATEWAY_KEY || '0e8efaddb74d411a929cb41a3d08b36d';
const serviceLine = process.env.VITE_AI_GATEWAY_SERVICE_LINE || 'cxm';
const brand = process.env.VITE_AI_GATEWAY_BRAND || 'merkle';
const project = process.env.VITE_AI_GATEWAY_PROJECT || 'ChatBotEnglishTeacher';
const headerApiVersion = process.env.VITE_AI_GATEWAY_HEADER_API_VERSION || 'v15';

const targetUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

async function testConnection() {
  console.log(`[AI Test] Target: ${targetUrl}`);
  console.log(`[AI Test] Project: ${project}, Brand: ${brand}`);

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': key,
        'api-key': key,
        'x-service-line': serviceLine,
        'x-brand': brand,
        'x-project': project,
        'api-version': headerApiVersion,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an English-Thai vocabulary tutor. Respond ONLY with valid JSON: {"word": "...", "thai_meaning": "...", "thai_phonetic": "..."}',
          },
          { role: 'user', content: 'Vocabulary: "adventure"' },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 500,
      }),
    });

    console.log(`[AI Test] Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('[AI Test] Result:');
    console.log(data.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('[AI Test] Failed:', err);
  }
}

testConnection();
